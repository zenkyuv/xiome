
import {XiomeNotes} from "./notes/xiome-notes.js"
import {XiomeNotesButton} from "./notes-button/xiome-notes-button.js"
import {mixinShare, mixinSnapstateSubscriptions} from "../../../framework/component.js"
import {XiomeComponentOptions} from "../../../assembly/frontend/components/types/xiome-component-options.js"

export function integrateNotesComponents({
			models: {notesModel}
		}: XiomeComponentOptions) {

	return {
		XiomeNotes: (
			mixinSnapstateSubscriptions(notesModel.stateSubscribe)(
				mixinShare({
					notesModel,
				})(XiomeNotes)
			)
		),
		XiomeNotesButton: (
			mixinSnapstateSubscriptions(notesModel.stateSubscribe)(
				mixinShare({
					notesModel,
				})(XiomeNotesButton)
			)
		),
	}
}