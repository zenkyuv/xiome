
import {ops} from "../../../../framework/ops.js"
import {storePrivileges} from "../../store-privileges.js"
import {makeStoreState} from "../state/make-store-state.js"

export function makeStoreAllowance(state: ReturnType<typeof makeStoreState>) {
	const has = (key: keyof typeof storePrivileges) => {
		const privileges =
			ops.value(state.readable.accessOp)
				?.permit.privileges
					?? []
		return privileges.includes(storePrivileges[key])
	}
	return {
		get manageStore() { return has("manage store") },
		get controlStoreBankLink() { return has("control store bank link") },
		get giveAwayFreebies() { return has("give away freebies") },
	}
}
