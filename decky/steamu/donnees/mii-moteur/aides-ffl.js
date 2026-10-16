// Aides de FFL.js v2.2.2 pour le corps des Mii (AGPL-3.0-only, Arian Kordi) converties en script classique par
// outils/vrais_mii_vendor.py ou mii_moteur.py (decky/steamu/donnees/mii-moteur/SOURCE.md).
// Généré, ne pas modifier à la main. Sources : ressources-privees/mii/sources/ffl.js-2.2.2/helpers/SkeletonScalingExtensions.js, ressources-privees/mii/sources/ffl.js-2.2.2/helpers/ModelScaleDesc.js, ressources-privees/mii/sources/ffl.js-2.2.2/helpers/BodyUtilities.js
// ---- SkeletonScalingExtensions.js ----
(() => {
window.__pcvESM ||= {};
/*!
 * @file Extensions for Three.js to help allow per-bone scaling of skeletons.
 * @author Arian Kordi <https://github.com/ariankordi>
 */

// @ts-check
/*
Helpful references:
- [ ] https://github.com/lo-th/phy/blob/main/src/3TH/character/SkeletonExtand.js
- [ ] https://github.com/lo-th/lab/blob/master/src/lth/Skeleton_Add.js
- [ ] https://github.com/lo-th/Avatar.lab/blob/gh-pages/src/skeleton.js
Author of the THREE.Skeleton.prototype.update override, and
thus this entire method for scaling a model, is lo-th.
All other references I found on GitHub were simply copying his code.
*/

const THREE = window.THREE;

// // ---------------------------------------------------------------------
// //  Extensions for Skeleton Scaling
// // ---------------------------------------------------------------------

/**
 * A description for a model attached to a bone on a {@link THREE.Skeleton}.
 * This kind of attachment will follow the position of a scaled bone
 * while also allowing the attached model to maintain its own separate scale.
 * @typedef {{
 * obj: THREE.Object3D,
 * boneIdx: number,
 * localScale: THREE.Vector3|null
 * }} SkeletonAttachment
 */

/**
 * Custom version of {@link THREE.Skeleton} to add attachments.
 * @typedef {THREE.Skeleton & {
 * _attachments: Array<SkeletonAttachment>|undefined,
 * attach: function(THREE.Object3D, string, boolean=): void,
 * detach: function(THREE.Object3D): void
 * detachAll: function(): void
 * }} SkeletonWithAttachments
 */

/**
 * Custom version of {@link THREE.Bone} with custom scaling properties.
 * Note that the misspelled "scalling" name is still used from lo-th's original code.
 * @typedef {THREE.Bone & {
 * scalling: THREE.Vector3|undefined,
 * scaleForRootAdjust: THREE.Vector3Like|undefined,
 * }} BoneWithScaling
 */

/**
 * Adds extensions (override functions) to the THREE.Skeleton namespace ({@link THREE.Skeleton})
 * to enable hierarchical per-bone local scaling for Three.js skeletons.
 * @param {typeof THREE.Skeleton} Skeleton - The THREE.Skeleton class.
 */
function addSkeletonScalingExtensions(Skeleton) {
	if (/** @type {SkeletonWithAttachments} */ (Skeleton.prototype)._attachments) {
		console.warn('addSkeletonScalingExtensions: Already run, skipping.');
		return; // Already run, skip this.
	}

	// Replace function that runs every time a skeleton is updated.
	// Original function (r178, 2025, functionality is simple):
	// https://github.com/mrdoob/three.js/blob/e117b283555e0ccc5034fa5193b951bc987280ed/src/objects/Skeleton.js#L198
	Skeleton.prototype.update = (function () {
		// Static, shared variables to be used temporarily for every run.

		/** @readonly */ // - (Below two are defined in three.js Skeleton.js)
		const _identityMatrix = /* @__PURE__ */ new THREE.Matrix4().identity();
		// Used in main bone scale loop:
		const _offsetMatrix = /* @__PURE__ */ new THREE.Matrix4();

		const scaleMatrix = /* @__PURE__ */ new THREE.Matrix4();
		const posVec = /* @__PURE__ */ new THREE.Vector3();

		// Used for decomposing/composing when updating attachments:
		const tmpQuat = /* @__PURE__ */ new THREE.Quaternion();
		const tmpTrans = /* @__PURE__ */ new THREE.Vector3();

		/**
		 * Adjusts translation, if this bone is a direct child of the root (skl_root).
		 * @param {THREE.Object3D &
		 * {scaleForRootAdjust: THREE.Vector3Like|undefined}} bone - The bone to check/adjust for.
		 * @param {THREE.Matrix4} matrix - The local matrix.
		 */
		function adjustTranslationForRoot(bone, matrix) {
			// scaleForRootAdjust being present on the bone itself indicates its parent is root.
			// NOTE: This checks the bone's own property rather than the parent's, since the
			// root (e.g. skl_root) is sometimes not skinned, so it may not be a THREE.Bone
			// instance at all (GLTFLoader only creates THREE.Bone for skinned joints).
			if (!bone.scaleForRootAdjust) {
				return;
			}

			// Get translation/W-axis from matrix.
			const translation = tmpTrans.setFromMatrixPosition(matrix);
			// Use the scale vector to adjust translation.
			const scale = bone.scaleForRootAdjust;

			// Multiply translation by YYX axes:
			translation.x *= scale.y;
			translation.y *= scale.y;
			translation.z *= scale.x;
			// Move Y down to keep the model's root (legs) planted.
			translation.y += (scale.x - scale.y); //* 1.0;
			// 1.0 = Local-to-world scale of the body model.

			matrix.setPosition(translation); // Set translation back on matrix.
		}

		/**
		 * @param {Array<SkeletonAttachment>} attachments - The attachment array.
		 * @param {Parameters<typeof THREE.Matrix4.prototype.fromArray>[0]} boneMatrices -
		 * The raw matrices array to update the attachment with.
		 * @param {typeof THREE.Skeleton.prototype.boneInverses} boneInverses -
		 * boneInverses array from the skeleton, to apply inverse bind matrix.
		 */
		function updateAttachments(attachments, boneMatrices, boneInverses) {
			for (const at of attachments) {
				// _offsetMatrix - Temporary matrix for the bone's worldMatrix.
				// scaleMatrix - Temporary matrix for the inverted parent.

				// Get the world matrix of the bone we just fed to skinning:
				_offsetMatrix.fromArray(boneMatrices, at.boneIdx * 16); // Already scaled.

				// Apply the inverse bind matrix to the attachment.
				_offsetMatrix.multiplyMatrices(_offsetMatrix,
					scaleMatrix.copy(boneInverses[at.boneIdx]).invert());

				// The caller wants to preserve the attachment's own local scale.
				if (at.localScale) {
					// Remove the bone's scale by re-composing with the local scale.
					_offsetMatrix.decompose(tmpTrans, tmpQuat, posVec);
					_offsetMatrix.compose(tmpTrans, tmpQuat, at.localScale);
				}

				// Copy bone-space to world-space for the attachment.
				// at.obj.matrixWorld.copy(_offsetMatrix);// .multiply(at.local);
				// at.obj.matrixWorldNeedsUpdate = false; // Make the matrix stay put.

				/** The world matrix of the object's parent, or identity if there is none. */
				const parentWorld = at.obj.parent ? at.obj.parent.matrixWorld : _identityMatrix;
				scaleMatrix.copy(parentWorld).invert(); // Convert world to local matrix.

				// Multiply two matrices and store result in the object's matrix.
				at.obj.matrix.multiplyMatrices(scaleMatrix, _offsetMatrix);
				at.obj.updateMatrixWorld(true); // Update now. (Not recommended to change directly.)
			}
		}

		/**
		 * Override of the update function to apply per-bone scaling and attachments.
		 * In the author (https://github.com/lo-th)'s words: "force local scalling"
		 * From lab (2019): https://github.com/lo-th/lab/blob/5e8949f3202a952df2269e80f40a93f362cf22aa/src/lth/Skeleton_Add.js#L136
		 * From Avatar.lab (2017): https://github.com/lo-th/Avatar.lab/blob/e96e7f3862c04feb7ce9fb6744561ffb8661fb21/src/skeleton.js#L5
		 * @this {SkeletonWithAttachments}
		 */
		return function update() {
			console.assert(this.boneMatrices instanceof Float32Array); // Enforce non-null.
			const boneMatrices = /** @type {Float32Array} */ (this.boneMatrices);

			// For each bone, calculate the matrixWorld and then apply custom per-bone scaling.
			for (let i = 0; i < this.bones.length; i++) { // Flatten bone matrices to array.
				const bone = /** @type {BoneWithScaling|undefined} */ (this.bones[i]);
				/** Current bone's matrixWorld. It will be re-assigned if there is scaling. */
				let matrixWorld = bone ? bone.matrixWorld : _identityMatrix;

				// If the bone has "scalling" (note spelling!), apply it to the bone.
				if (bone && bone.scalling) {
					matrixWorld = _offsetMatrix.copy(matrixWorld).scale(bone.scalling);

					// Adjust translation for the root (skl_root).
					// if (bone.parent && bone.parent instanceof THREE.Bone &&
					//	 bone.scalling && /** @type {BoneWithScaling} */ (bone.parent)
					//	 .isScallingRoot) {
					adjustTranslationForRoot(bone, matrixWorld);

					// Adjust translation for children so they follow the scaled parent.
					for (const child of bone.children) {
						scaleMatrix.copy(matrixWorld).multiply(child.matrix);
						posVec.setFromMatrixPosition(scaleMatrix);
						child.matrixWorld.setPosition(posVec);
					}
				}

				// Update boneMatrices[] (like the original update function)
				_offsetMatrix.multiplyMatrices(matrixWorld, this.boneInverses[i]);
				_offsetMatrix.toArray(boneMatrices, i * 16);
			}

			// Update all registered attachments after bones are updated.
			if (this._attachments) {
				updateAttachments(this._attachments, boneMatrices, this.boneInverses);
			}

			// Finally, update boneTexture (like the original update function)
			if (this.boneTexture) {
				this.boneTexture.needsUpdate = true;
			}
		};
	})();

	// Define SkeletonWithAttachments extensions.

	/** @type {SkeletonWithAttachments} */ (Skeleton.prototype).attach =
	/**
	 * @param {THREE.Object3D} obj - The Object3D to attach (SkinnedMesh, glTF scene, etc.)
	 * @param {string} boneName - Bone name to look up once.
	 * @param {boolean} [useBoneScale] - If this is false, then the bone's individual
	 * scale is ignored, and the object's local scale will be used when attaching.
	 * @throws {Error} Throws if the bone specified in `boneName` cannot be found.
	 * @this {SkeletonWithAttachments}
	 */
	function (obj, boneName, useBoneScale = false) {
		const boneIdx = this.bones.findIndex(b => b.name === boneName);
		if (boneIdx === -1) {
			throw new Error(`Bone '${boneName}' not found.`);
		}

		// Turn off auto‐updates so our manual matrix stays put.
		obj.matrixAutoUpdate = false;
		// obj.matrixWorldAutoUpdate = false; // Not modifying matrixWorld directly.

		const localScale = useBoneScale ? null : obj.scale;
		/** @type {SkeletonAttachment} */
		const att = { obj, boneIdx, localScale };

		// Add the attachment or create the _attachments array.
		if (this._attachments) {
			this._attachments.push(att);
		} else {
			this._attachments = [att];
		}
		// this.update(); // Update the attachment instantly. (Not needed)
	};

	/** @type {SkeletonWithAttachments} */ (Skeleton.prototype).detach =
	/**
	 * @param {THREE.Object3D} obj - The object to detach.
	 * @this {SkeletonWithAttachments}
	 */
	function (obj) {
		if (this._attachments) {
			this._attachments = this._attachments.filter(a => a.obj !== obj);
		}
	};

	/** @type {SkeletonWithAttachments} */ (Skeleton.prototype).detachAll =
	function () {
		this._attachments = null;
	};
}



window.__pcvESM.addSkeletonScalingExtensions = addSkeletonScalingExtensions;
})();
// ---- ModelScaleDesc.js ----
(() => {
window.__pcvESM ||= {};
/*!
 * @file Descriptions (tables) of how to scale
 * different Mii body models and their bone names.
 * @author Arian Kordi <https://github.com/ariankordi>
 */

// @ts-check

const THREE = window.THREE;

/** @typedef {import('./SkeletonScalingExtensions.js').BoneWithScaling} BoneWithScaling */

// // ---------------------------------------------------------------------
// //  Descriptions for Body Model Scaling
// // ---------------------------------------------------------------------

/**
 * Describes the ways in which to apply the scale vector on
 * the model's bones. Each array represents names of bones.
 * @typedef {Object} ModelScaleDesc
 * @property {Array<string>|null} xyz - List of bones that should be scaled with the unmodified scale vector.
 * If null, then all bones will receive the unmodified scale vector, unless ones excluded in `none`.
 * @property {Array<string>} xyzYMin1 - List of bones that should be scaled with all three dimensions
 * of the scale vector, but with Y clamped to a minimum of 1.0. Used for the head bone (cosmetic neck).
 * @property {Array<string>|null} yxz - List of bones that should be scaled using the scale vector with Y and X swapped.
 * If null, then all bones will receive the the vector with Y and X swapped, unless ones excluded in `none`.
 * @property {Array<string>} scalar - List of bones that should be scaled uniformly using X for all dimensions.
 * @property {Array<string>|null} none - List of bones that should receive no additional scale.
 * Only applicable if `xyz` or `yxz` are non-null.
 * @property {string} root - The name of the root bone for which to adjust translation
 * (usually something along the lines of "skl_root").
 * @property {string} head - The name of the bone for which to attach the model's head.
 * NOTE: The head bone is not necessarily used for scaling, but is provided here for convenience.
 */

/**
 * Scaling description for the body model used in the editor.
 * Tested with Wii U (MiiBodyMiddle.bfres) and Switch (MiiBodyHigh.bfres) body models.
 * Also tested with the Wii (Mii Channel) body model, and the 3DS body should work too.
 * This model is mostly unused outside of system titles and certain first-party Wii channels (Wii Room).
 * Main reference: mii_VariableIconBodyImpl.o from NintendoSDK,
 * void nn::mii::detail::`anonymous namespace'::UpdateScale(class nn::util::Vector3f *,
 * enum nn::mii::detail::VriableIconBodyBoneKind, struct nn::util::Float3 const &)
 * @type {ModelScaleDesc}
 */
const editorBodyScaleDesc = {
	root: 'skl_root', // Adjust translation based on skl_root.
	head: 'head', // Head bone.
	xyz: null, // Let all bones receive full XYZ scale by default.
	xyzYMin1: ['head'], // Prevent neck from appearing too short.
	// The arms and elbows receive YXZ scale.
	yxz: ['arm_l1', 'arm_l2', 'arm_r1', 'arm_r2', 'elbow_l', 'elbow_r'],
	// Wrist, Shoulder, Ankle, Knee
	scalar: ['wrist_l', 'wrist_r', 'shoulder_l', 'shoulder_r',
		'ankle_l', 'ankle_r', 'knee_l', 'knee_r'],
	none: ['all_root', 'body']
	// NOTE: Bone whitelist or blacklist? This is using blacklist, but perhaps
	// for models with more bones/roots, a whitelist will cause less problems.
};

/**
 * Scaling description for the body model used in Miitomo, which
 * is similar to the model used in Tomodachi Life 3DS.
 * In contrast to the editor body, its bones use YXZ scale by default.
 * Reference: FUN_005357f0 in libcocos2dcpp.so 2.4.0 (inlined anim lerp/body scaling)
 * @type {ModelScaleDesc}
 */
const archBodyScaleDesc = {
	root: 'Skl_Root',
	head: 'Head', // Head bone. Note that there is also "z_Head".
	xyz: [], // No bones are receiving XYZ scale.
	xyzYMin1: [],
	yxz: null, // All bones receive YXZ scale by default.
	// Wrist, Ankle (no shoulders, knees)
	scalar: ['Ankle_R', 'Ankle_L', 'Wrist_R', 'Wrist_L'],
	// Above are referenced in body scale func. (Other bones are not mentioned by strings)
	// At the beginning of body scale func, jointRoot and Head are skipped.
	none: ['jointRoot', 'Head', 'nw4f_root'/** < For Super Mario Maker 2 bfres */]
};

/**
 * Detects and returns the appropriate {@link ModelScaleDesc} for the body model.
 * Currently just differentiates between editor's body model and Miitomo body model.
 * @param {THREE.Object3D} object - The model for which to detect the description.
 * @returns {ModelScaleDesc} The `ModelScaleDesc` that was detected.
 * @throws {Error} Throws if the `ModelScaleDesc` could not be detected.
 */
function detectModelDesc(object) {
	/** @type {ModelScaleDesc|null} */
	let desc = null;

	// Since the name/capitalization of skl_root differs,
	// this will be used to differentiate between editor and Miitomo body.
	object.traverse((bone) => {
		// if (!(bone instanceof THREE.Bone)) {
		// 	return;
		// }
		// ^^ may not work reliably? because some are nodes...?
		switch (bone.name) {
			case 'Skl_Root':
				desc = archBodyScaleDesc;
				break;
			case 'skl_root':
				desc = editorBodyScaleDesc;
				break;
		}
	});

	if (!desc) {
		throw new Error('detectModelDesc: Could not detect based on bone names.');
	}

	return desc;
}

/**
 * Apply scaling to a model's bones based on a given scale description.
 * If there are multiple SkinnedMeshes, make sure the bones are shared
 * between them by checking the IDs. Otherwise, this needs to run for every SkinnedMesh.
 * @param {THREE.Object3D} object - The model to apply scaling to.
 * @param {THREE.Vector3Like} scaleVector - The base scale vector.
 * @param {ModelScaleDesc} desc - Scaling behavior descriptor for the model.
 */
function applyScaleDesc(object, scaleVector, desc) {
	// Handle the input as an object with multiple SkinnedMeshes.
	object.traverse((node) => {
		if (node instanceof THREE.SkinnedMesh) {
			const skl = /** @type {THREE.SkinnedMesh} */ (node).skeleton;
			applyScaleDescToBones(skl.bones, scaleVector, desc);

			// Eager skeleton update (to avoid deferred frame-lagged updates).
			// It will still update without this, but the update will be delayed.
			skl.update();
		}
	});
	// model.traverse(node =>
	// 	node instanceof THREE.SkinnedMesh &&
	// 		// On all SkinnedMeshes, apply to each skeleton.
	// 		applyScaleDescToBones(/** @type {THREE.SkinnedMesh} */(node)
	// 			.skeleton.bones, scaleVector, desc));
}

/**
 * Apply scaling to the array of bones based on a given scale description.
 * @param {Array<THREE.Bone>} bones - The array of bones to apply scaling to.
 * This comes from {@link THREE.SkinnedMesh.prototype.skeleton.bones}.
 * @param {THREE.Vector3Like} scaleVector - The base scale vector.
 * @param {ModelScaleDesc} desc - Scaling behavior descriptor for the model.
 * @throws {Error} Throws if addSkeletonScalingExtensions has not been called yet.
 */
function applyScaleDescToBones(bones, scaleVector, desc) {
	if (!('attach' in THREE.Skeleton.prototype)) { // Notify the caller if this won't work.
		throw new Error('applyScaleDesc: This function to apply "scalling" has no effect, until "addSkeletonScalingExtensions" is run to patch THREE.Skeleton.prototype to allow per-bone scaling. Try running that first.');
	}

	for (const bone of /** @type {Array<BoneWithScaling>} */ (bones)) {
		const name = bone.name;

		// Mark root's direct children to be used for translation adjustment.
		// NOTE: This checks the bone's parent name rather than the bone's own name,
		// since the root (e.g. skl_root) is sometimes not skinned and therefore
		// not present in `bones` at all, so it can never be "bone" in this loop.
		// This bone still needs its normal scale/`.scalling` applied below,
		// so this does NOT skip to the next bone like it did previously.
		if (bone.parent?.name === desc.root) {
			bone.scaleForRootAdjust = scaleVector; // Set scale vector to be used.
		}

		// Skip if explicitly listed in `none`.
		if (desc.none?.includes(bone.name)) {
			continue;
		}

		/** Final scale vector to be determined for the bone. */
		const scale = new THREE.Vector3();

		// Test for XYZ, YXZ, Y-clamp, and scalar.
		if (desc.xyz?.includes(name)) {
			// console.debug('xyz:', name);
			scale.set(scaleVector.x, scaleVector.y, scaleVector.z);
		} else if (desc.yxz?.includes(name)) {
			// console.debug('yxz:', name);
			scale.set(scaleVector.y, scaleVector.x, scaleVector.z);
		} else if (desc.scalar.includes(name)) {
			// console.debug('scalar:', name);
			scale.setScalar(scaleVector.x);
		} else if (desc.xyzYMin1.includes(name)) {
			scale.set(scaleVector.x, Math.max(scaleVector.y, 1), scaleVector.z);
		} else {
			// Default: Either xyz, yxz, or no scale.
			if (desc.xyz === null) {
				// console.debug('xyz:', name);
				scale.set(scaleVector.x, scaleVector.y, scaleVector.z);
			} else if (desc.yxz === null) {
				// console.debug('yxz:', name);
				scale.set(scaleVector.y, scaleVector.x, scaleVector.z);
			}
			// Else, do not set scale.
		}

		bone.scalling = scale;
	}
}



window.__pcvESM.editorBodyScaleDesc = editorBodyScaleDesc;
window.__pcvESM.archBodyScaleDesc = archBodyScaleDesc;
window.__pcvESM.detectModelDesc = detectModelDesc;
window.__pcvESM.applyScaleDesc = applyScaleDesc;
window.__pcvESM.applyScaleDescToBones = applyScaleDescToBones;
})();
// ---- BodyUtilities.js ----
(() => {
window.__pcvESM ||= {};
/**
 * @file Contains functions to help attach a Mii body model
 * to its head, apply materials, and draw an icon. Taken from a jsfiddle
 * a jsfiddle I made to draw the Mii with body scaling and shaders.
 * This may later be broken into more concise snippets in FFL.js itself.
 * @author Arian Kordi <https://github.com/ariankordi>
 */
// @ts-check

const THREE = window.THREE;
const { applyScaleDescToBones } = window.__pcvESM;

// Imports for standalone JSDoc types.
/**
 * @typedef {import('../materials/SampleShaderMaterial.js').SampleShaderMaterialColorInfo} SampleShaderMaterialColorInfo
 * @typedef {import('./SkeletonScalingExtensions.js').SkeletonWithAttachments} SkeletonWithAttachments
 * @typedef {import('./ModelScaleDesc.js').ModelScaleDesc} ModelScaleDesc
 * @typedef {import('../ffl.js').MaterialConstructor} MaterialConstructor
 */

/**
 * A body model with its ModelScaleDesc and animations altogether.
 * @typedef {Object} BodyModel
 * @property {THREE.Object3D} model
 * @property {Array<THREE.AnimationClip>} animations - AnimationClips from the glTF.
 * @property {ModelScaleDesc} scaleDesc
 * @property {THREE.AnimationMixer} mixer
 */

// // ---------------------------------------------------------------------
// //  Model Loading Helpers
// // ---------------------------------------------------------------------

/**
 * Async wrapper to load a GLTF model from URL.
 * @param {string} url - The URL to load the glTF model from.
 * @returns {Promise<import('three/examples/jsm/loaders/GLTFLoader.js').GLTF>}
 * The GLTF object. `gltf.scene` contains the mesh group.
 */
// const loadGLTF = async url =>
// 	new Promise((resolve, reject) => {
// 		new GLTFLoader().load(url, resolve, undefined, reject);
// 	});

// // ---------------------------------------------------------------------
// //  Body Model Setup
// // ---------------------------------------------------------------------

/**
 * Searches the Object3D for a SkinnedMesh that contains the given bone.
 * @param {THREE.Object3D} root - Where to search for the SkinnedMesh.
 * @param {string} boneName - Name of the bone in the parent SkinnedMesh to find.
 * @returns {THREE.SkinnedMesh|null} The SkinnedMesh containing the bone, or null if it was not found.
 */
function findSkinnedMeshWithBone(root, boneName) {
	let found = /** @type {THREE.SkinnedMesh|null} */ (null);
	root.traverse((node) => {
		if (!found && node instanceof THREE.SkinnedMesh &&
			node.skeleton.bones.some(bone => bone.name === boneName)) {
			found = node;
		}
	});
	return found;
}

/**
 * Finds body and pants meshes, and applies modulateMode/modulateType.
 * @param {THREE.Object3D} model - The body model meshes.
 */
function applyModulateToBody(model) {
	/** @type {THREE.SkinnedMesh|null} */
	let lastSkinnedMesh = null;
	// To find the pants, let's find the last SkinndMesh and assume that's it.
	model.traverse((node) => {
		if (node instanceof THREE.SkinnedMesh) {
			lastSkinnedMesh = node;
		}
	});
	// (TODO: This method will NOT WORK for body models extracted from Miitomo PODs.)

	let meshIndex = 0;
	model.traverse((mesh) => {
		// The reason this is identifying SkinnedMesh instead of just Mesh
		// is to avoid detecting the head model. But, if the head is also
		// a SkinnedMesh and it's attached to the body, then it will catch here.
		if (!(mesh instanceof THREE.SkinnedMesh)) {
			return;
		}

		/**
		 * Assume that the mesh is pants if it is the last
		 * skinned mesh, or even. Otherwise, a it's the body.
		 */
		const isPants = lastSkinnedMesh
			? mesh.id === lastSkinnedMesh.id
			// If there is no lastSkinnedMesh, then assume this
			// is the pants if it is the second mesh.
			: (meshIndex % 2 === 0);

		mesh.geometry.userData.modulateMode = 0; // Constant color/opaque.
		mesh.geometry.userData.modulateType = isPants
			? 10 // Pants
			: 9; // Body

		meshIndex++;
	});
}

/**
 * Applies colors and the current material to the body/pants.
 * @param {BodyModel} body - The body model to prepare.
 * @param {MaterialConstructor} mat - The material to apply on the body model.
 * @param {THREE.Color} favoriteColor - The favorite color of the CharModel.
 * @param {THREE.Vector3Like} bodyScale - The vector to scale the body model with.
 * @param {THREE.Color} pantsColor - The pants color for the body.
 */
function prepareBodyForCharModel(body, mat, favoriteColor, bodyScale, pantsColor) {
	applyModulateToBody(body.model); // Add modulateMode/modulateType.
	applyMaterialToGroup(body.model, mat, null); // TODO: info.colorInfo);

	// Set the colors on the body model.
	body.model.traverse((mesh) => {
		// The reason this is identifying SkinnedMesh instead of just Mesh
		// is to avoid detecting the head model. But, if the head is also
		// a SkinnedMesh and it's attached to the body, then it will catch here.
		if (!(mesh instanceof THREE.SkinnedMesh) ||
			!('modulateType' in mesh.geometry.userData)) {
			return;
		}
		if (mesh.geometry.userData.modulateType === 9) { // Body
			mesh.material.color = favoriteColor;
		} else if (mesh.geometry.userData.modulateType === 10) { // Pants
			mesh.material.color = pantsColor;
		}
	});

	const skinned = body.model.getObjectByProperty('type', 'SkinnedMesh');
	if (skinned && skinned instanceof THREE.SkinnedMesh) {
		const skl = skinned.skeleton;
		applyScaleDescToBones(skl.bones, bodyScale, body.scaleDesc);
		skl.update(); // Eagerly update the skeleton to avoid a delay.
	}
}

/** The absolute world-scale of the head divided by the body's scale. */
const headToBodyScale = 10 / 7;

/**
 * Attaches the head model to the body model's head bone.
 * Also calls {@link SkeletonWithAttachments.attach} so that the head
 * model's position follows the scaled head bone without getting scaled itself.
 * @param {BodyModel} body - The body model to attach the head ot.
 * @param {THREE.Group} head - The head (CharModel) to attach.
 * @throws {Error} Throws if the head bone or SkinnedMesh was not found.
 */
function attachHeadToBody(body, head) {
	//  * @param {string} headBoneName - The name of the head bone from {@link typeof ModelScaleDesc.head}.
	const headBoneName = body.scaleDesc.head;
	if (headBoneName === 'Head') {
		console.error('TODO: Head is not attached correctly to the Miitomo body. Skipping it so you can see what the model looks like anyway.');
		return;
	}

	const headBone = body.model.getObjectByName(headBoneName);
	if (!headBone || !(headBone instanceof THREE.Bone)) {
		throw new Error('Head bone not found.');
	}
	// Locate the skeleton in the SkinnedMesh, needed to call attach().
	const skinnedMesh = findSkinnedMeshWithBone(body.model, headBoneName);
	if (!skinnedMesh) {
		throw new Error('No skinned mesh with head bone.');
	}
	const skeleton = /** @type {SkeletonWithAttachments} */ (skinnedMesh.skeleton);

	// Set head to body scale ratio.
	// Multiply by 0.1, assuming the body's world scale was normalized to 1.0.
	head.scale.multiplyScalar(0.1 * headToBodyScale);

	// Add the model to the scene, and attach it to the SkeletonWithAttachments.
	headBone.add(head); // This will render it.
	skeleton.attach(head, headBoneName); // This positions it with the scaled bone.
}

// // ---------------------------------------------------------------------
// //  Shader/Material Class Helpers
// // ---------------------------------------------------------------------

/**
 * Applies a new material class to the mesh and applying existing
 * parameters from the old material and userData to an FFL-compatible material.
 * Also see `onShaderMaterialChange` from FFL.js/examples/demo-basic.js.
 * @param {THREE.Mesh} mesh - The mesh to apply the material to.
 * @param {MaterialConstructor} newMatClass - The new material class to apply.
 * @param {SampleShaderMaterialColorInfo|null} colorInfo - Specific object needed for SampleShaderMaterial.
 */
function applyMaterialClassToMesh(mesh, newMatClass, colorInfo) {
	/** Whether the new material supports FFL swizzling. */
	const forFFLMaterial = 'modulateMode' in newMatClass.prototype;
	// Recreate material with same parameters but using the new shader class.
	const oldMat = /** @type {THREE.MeshBasicMaterial} */ (mesh.material);
	/** Get modulateMode/Type */
	const userData = mesh.geometry.userData;

	/** Do not include the parameters if forFFLMaterial is false. */
	const modulateModeType = forFFLMaterial
		? { // modulateMode/Type will be used from the userData or old material.
			modulateMode: 'modulateMode' in oldMat ? oldMat.modulateMode : userData.modulateMode ?? 0,
			// This setter will set side too:
			modulateType: 'modulateType' in oldMat ? oldMat.modulateType : userData.modulateType ?? 0
		}
		: {};

	/**
	 * Parameters for the shader material. Using SampleShaderMaterialParameters
	 * as a lowest common denominator, but others can also be used.
	 * @type {import('three').MeshBasicMaterialParameters
	 * & import('../materials/SampleShaderMaterial.js').SampleShaderMaterialParameters}
	 */
	const params = {
		// _side = original side from LUTShaderMaterial, must be set first
		side: ('_side' in oldMat) ? /** @type {THREE.Side} */ (oldMat._side) : oldMat.side,
		...modulateModeType,
		color: oldMat.color, // should be after modulateType
		transparent: Boolean(oldMat.transparent || oldMat.alphaTest)
	};
	if (oldMat.map) {
		params.map = oldMat.map;
	}

	if ('modulateType' in userData) {
		params.modulateMode = userData.modulateMode ?? 0;
		params.modulateType = userData.modulateType;
	}
	if (colorInfo && 'colorInfo' in newMatClass.prototype) {
		// console.debug('got colorinfo on', mesh)
		params.colorInfo = colorInfo;
	}

	mesh.material = new newMatClass(params);
	oldMat.dispose(); // Dispose the old material, keeping the map.

	// HACK: For SampleShaderMaterial with glTF head models, let's not
	// set drawType uniform to faceline. TODO: Specifically only
	// needs to be done if it's not from FFL.js, and, if faceline
	// color is not transparent (will also result in beards having wrong color)
	/*
	if (mesh.material instanceof SampleShaderMaterial &&
		userData.modulateType === 0) {
		// TODO: This will also break if you request: /miis/image.glb?shaderType=switch&data=
		// 0804400308040402020C0308060406020A0000020000000804100A01001E4004000214031304170D06020A040109
		// (Should we automatically include &shaderType=switch when SampleShaderMaterial is detected?)
		mesh.material.uniforms.drawType.value = 0;
	}
	*/
}

/**
 * Calls {@link applyMaterialClassToMesh} on a group of multiple
 * meshes (head or body model), using the name of the material.
 * @param {THREE.Object3D} group - The group to apply the material to.
 * @param {MaterialConstructor} newMatClass - The new material class to apply.
 * @param {SampleShaderMaterialColorInfo|null} colorInfo - Needed for SampleShaderMaterial.
 * @returns {void}
 */
const applyMaterialToGroup = (group, newMatClass, colorInfo) =>
	group.traverse(node =>
		(node instanceof THREE.Mesh) &&
		applyMaterialClassToMesh(node, newMatClass, colorInfo)
	);

/**
 * Disposes geometry, material and map, and skeleton.
 * @param {THREE.Object3D} model - The group of meshes or SkinnedMeshes to dispose.
 */
function disposeModel(model) {
	model.traverse((node) => {
		if (node instanceof THREE.Mesh) {
			node.geometry.dispose();
			if (node.material instanceof THREE.Material) {
				const map = /** @type {THREE.MeshBasicMaterial} */ (node.material).map;
				if (map) {
					map.dispose();
				}
				node.material.dispose();
			}
		}
		// Additionally dispose skeleton if it is a SkinnedMesh.
		if (node instanceof THREE.SkinnedMesh && node.skeleton) {
			node.skeleton.dispose();
		}
	});
}

// // ---------------------------------------------------------------------
// //  Icon Camera Helpers
// // ---------------------------------------------------------------------

/**
 * Intended to match Wii U Mii Maker, and therefore also account/NNAS/cdn-mii 1.0.0 renders.
 * Parameters are from FUN_02086e94 in ffl_app.rpx, search for 57.553 / 0x42663646
 * @returns {THREE.PerspectiveCamera} Camera for the face only view.
 */
function getFaceCamera() {
	// Create camera with 15 degrees FOV.
	const camera = new THREE.PerspectiveCamera(15, 1 /* square */, 50, 1000);
	// Intended to be used with the head at 0.14 (<- exact) scale.
	camera.position.set(0, 4.805, 57.553); // 4.205 + 0.6
	return camera;
}

/**
 * Gets whole body camera that accounts for the height.
 * Performs Z-position interpolation like in FUN_02086e94 in ffl_app.rpx (Wii U Mii Maker).
 * @param {number} aspect - Aspect ratio for the camera.
 * @param {number} height - Height value of the CharModel to use in interpolation.
 * @returns {THREE.PerspectiveCamera} Camera for the whole body view.
 */
function getWholeBodyCamera(aspect, height) {
	// Create camera with 15 degrees FOV.
	const camera = new THREE.PerspectiveCamera(15, aspect);

	// These values are usually included in this order within a table.
	const yOffset = 0;
	const yFactor1 = 10.85;
	const yFactor2 = 90;
	// const fovy = 15.0;
	const coefficientZMin = 0.85;
	const coefficientZMax = 1.32;

	const rootHeight = 0;
	/** Camera Y position. */
	const y = (yFactor1 - rootHeight) *
		(height / 64 * 0.15 + 0.85) + rootHeight;

	/** Height normalized to [-1, 1] range. */
	const heightFactor = (height / 127 - 0.5) * 2;
	/** Camera Z position / zoom. */
	let z = ((coefficientZMax + coefficientZMin) * 0.5 - 1) * heightFactor *
		heightFactor + (coefficientZMax - coefficientZMin) * 0.5 * heightFactor + 1;
	z *= yFactor2;

	camera.position.set(0, y + yOffset, z);
	return camera;
}

/**
 * Moves the position of the camera up so that the head is in center.
 * @param {THREE.Camera} camera - The camera whose position to move.
 * @param {BodyModel} body - The body model.
 */
function adjustCameraForBodyHead(camera, body) {
	body.model.updateMatrixWorld(); // Propagate transforms.
	// Forced skeleton update to account for body scaling.
	body.model.traverse(s => s instanceof THREE.SkinnedMesh && s.skeleton.update());

	const head = /** @type {THREE.Bone} */ (body.model.getObjectByName(body.scaleDesc.head));
	// const root = /** @type {THREE.Bone} */ (body.model.getObjectByName(body.scaleDesc.root));
	console.assert(head);// && root);
	// Get the world translation of the body's root, and the head position.
	const headPos = new THREE.Vector3().setFromMatrixPosition(head.matrixWorld);
	const rootPos = new THREE.Vector3().setFromMatrixPosition(body.model.matrixWorld);

	camera.position.y += headPos.y - rootPos.y; // Move the camera up.
}



window.__pcvESM.prepareBodyForCharModel = prepareBodyForCharModel;
window.__pcvESM.attachHeadToBody = attachHeadToBody;
window.__pcvESM.applyMaterialToGroup = applyMaterialToGroup;
window.__pcvESM.disposeModel = disposeModel;
window.__pcvESM.getFaceCamera = getFaceCamera;
window.__pcvESM.getWholeBodyCamera = getWholeBodyCamera;
window.__pcvESM.findSkinnedMeshWithBone = findSkinnedMeshWithBone;
window.__pcvESM.adjustCameraForBodyHead = adjustCameraForBodyHead;
})();
