const REPO_BASE = "https://api.github.com/repos/nycmeshnet/nycmesh-configs";

export async function fetchVersions() {
	const tags = await get(REPO_BASE + "/tags");
	return tags.map((t) => t.name);
}

export async function fetchDevices(version) {
	if (!version) {
		throw new Error("Missing version");
	}
	const { tree } = await get(REPO_BASE + "/git/trees/" + version);
	const items = tree.filter((item) => item.type === "tree");
	return items.map(({ path, url }) => ({
		name: path,
		url,
	}));
}

export async function fetchTemplates(version, device) {
	if (!device || !version) {
		throw new Error("Missing device or version");
	}

	const { tree } = await get(device.url);
	const templateItems = tree.filter((item) => item.path.match(/.tmpl$/));
	// const metadataItems = tree.filter((item) => item.path === "meta.json");

	return Promise.all(
		templateItems.map(({ url, path }) =>
			get(url).then(({ content }) => ({
				name: path,
				content: atob(content),
			}))
		)
	);
}

async function get(url) {
	const response = await fetch(url);
	if (response.status !== 200) {
		const error = "GitHub request failed!";
		alert(error);
		throw new Error(error);
	}
	return response.json();
}
