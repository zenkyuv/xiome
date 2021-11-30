
import {Op, ops} from "../../../../framework/ops.js"
import {AccessPayload} from "../../../auth/types/auth-tokens.js"
import {StripeConnectDetails, StripeConnectStatus} from "../../types/store-concepts.js"
import {snapstate} from "../../../../toolbox/snapstate/snapstate.js"

export function makeStoreState() {
	return snapstate({

		accessOp:
			<Op<AccessPayload>>
				ops.none(),

		connectStatusOp:
			<Op<StripeConnectStatus>>
				ops.none(),

		connectDetailsOp:
			<Op<StripeConnectDetails>>
				ops.none(),

		// subscriptionPlansOp:
		// 	<Op<SubscriptionPlan[]>>
		// 		ops.none(),

		// subscriptionPlanCreationOp:
		// 	<Op<undefined>>
		// 		ops.none(),
	})
}
