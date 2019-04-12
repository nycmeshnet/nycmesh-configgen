const REPO_BASE = "https://api.github.com/repos/nycmeshnet/nycmesh-configs/";

export const SET_VERSIONS = "SET_VERSIONS";
export const SET_DEVICES = "SET_DEVICES";
export const SET_TEMPLATES = "SET_TEMPLATES";

export function loadVersions(dispatch) {
	get(REPO_BASE + "tags")
		.then(j => j.map(i => i.name)) // Branch names are version names
		.then(versions => dispatch({ type: SET_VERSIONS, versions }))
		.catch(error => console.error(error));
}

export function loadDevices(version, dispatch) {
	if (!version) {
		console.error("Missing params");
		return;
	}
	get(REPO_BASE + "git/trees/" + version)
		.then(({ tree }) => tree.filter(i => i.type === "tree")) // Folders are devices
		.then(deviceFolders => {
			return deviceFolders.map(device => ({
				name: device.path,
				URL: device.url
			}));
		})
		.then(devices => dispatch({ type: SET_DEVICES, devices, version }))
		.catch(error => console.error(error));
}

export function loadTemplates(device, version, dispatch) {
	if (!device || !version) {
		console.error("Missing params");
		return;
	}
	get(device.URL)
		.then(({ tree }) => {
			const templateFiles = tree.filter(file =>
				file.path.match(/.tmpl$/)
			);
			const metaFiles = tree.filter(file => file.path === "meta.json");
			const metaFile = metaFiles.length ? metaFiles[0] : null;
			return { templateFiles, metaFile };
		})
		.then(({ templateFiles, metaFile }) => {
			// Fetch device template files
			Promise.all(
				templateFiles.map(templateFile =>
					get(templateFile.url).then(({ content }) => ({
						name: templateFile.path,
						content: atob(content)
					}))
				)
			).then(templates => {
				// Fetch device metadata
				if (metaFile) {
					get(metaFile.url).then(({ content }) => {
						const contentText = atob(content);
						try {
							const deviceMetadata = JSON.parse(contentText);
							console.log(deviceMetadata);
							// TODO: Handle metadata
							dispatch({
								type: SET_TEMPLATES,
								templates,
								device,
								version
							});
						} catch (error) {
							console.error(error);
						}
					});
				} else {
					dispatch({
						type: SET_TEMPLATES,
						templates,
						device,
						version
					});
				}
			});
		})
		.catch(error => console.error(error));
}

function get(URL) {
	try {
		return fetch(URL).then(response => {
			if (response.status !== 200) {
				alert("GitHub request failed!");
			}
			return response.json();
		});
	} catch (error) {
		console.error(error);
	}
}
