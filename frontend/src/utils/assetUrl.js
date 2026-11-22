// URL of a file in public/ (media, graphs, report, data) that also works under a sub-path deployment.
export const assetUrl = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
