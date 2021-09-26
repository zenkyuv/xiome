
import {VideoHosting} from "../../../types/video-concepts.js"
import * as Dacast from "../../../dacast/types/dacast-types.js"

export async function getDacastContent({
		dacast,
		reference: {provider, type, id},
	}: {
		dacast: Dacast.Client
		reference: VideoHosting.DacastReference
	}): Promise<Dacast.Content> {

	if (provider !== "dacast")
		throw new Error(`video content provider mismatch (expected "dacast", got "${provider}")`)
	
	switch (type) {
		case "vod": return dacast.vods.id(id).get()
		case "channel": return dacast.channels.id(id).get()
		case "playlist": return dacast.playlists.id(id).get()
		default: throw new Error(`unknown dacast type "${type}"`)
	}
}