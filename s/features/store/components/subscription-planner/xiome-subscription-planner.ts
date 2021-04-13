
import styles from "./xiome-subscription-planner.css.js"
import {renderIdentifier} from "./views/render-identifier.js"
import {AuthModel} from "../../../auth/models/types/auth/auth-model.js"
import {SubscriptionPlan} from "../../topics/types/subscription-plan.js"
import {ModalSystem} from "../../../../assembly/frontend/modal/types/modal-system.js"
import {ValueChangeEvent} from "../../../xio-components/inputs/events/value-change-event.js"
import {WiredComponent, mixinStyles, html, property} from "../../../../framework/component.js"
import {SubscriptionPlanDraft} from "../../api/tables/types/drafts/subscription-plan-draft.js"
import {renderWrappedInLoading} from "../../../../framework/loading/render-wrapped-in-loading.js"
import {PlanningSituation} from "../../models/subscription-planning-model/types/planning-situation.js"
import {subscriptionPlanningModel} from "../../models/subscription-planning-model/subscription-planning-model.js"

@mixinStyles(styles)
export class XiomeSubscriptionPlanner extends WiredComponent<{
		modals: ModalSystem
		authModel: AuthModel
		subscriptionPlanningModel: ReturnType<typeof subscriptionPlanningModel>
	}> {

	@property()
	private draft: SubscriptionPlanDraft = {
		label: <string>"",
		price: <number>0,
	}

	firstUpdated() {
		this.share.subscriptionPlanningModel.requestToStartLoadingPlans()
	}

	private renderListOfSubscriptionPlans(plans: SubscriptionPlan[]) {
		const {subscriptionPlanningModel, modals} = this.share

		function renderSinglePlan(plan: SubscriptionPlan) {

			async function handleDeactivate() {
				const confirmed = await modals.confirm({
					title: "permanently deactivate subscription plan?",
					body: `are you sure you want to end all ongoing recurring billing subscriptions for the plan "${plan.label}", and prevent future sales? this cannot be undone`,
					yes: {vibe: "negative", label: "deactivate"},
					no: {vibe: "neutral", label: "nevermind"},
					focusNthElement: 2,
				})
				if (confirmed)
					subscriptionPlanningModel.deactivatePlan(plan.subscriptionPlanId)
			}

			async function handleDelete() {
				const confirmed = await modals.confirm({
					title: "permanently delete subscription plan?",
					body: `are you sure you want to delete the subscription plan "${plan.label}"? this would delete the associated permissions role, even if customers had paid for it. this cannot be undone`,
					yes: {vibe: "negative", label: "delete"},
					no: {vibe: "neutral", label: "nevermind"},
					focusNthElement: 2,
				})
				if (confirmed)
					subscriptionPlanningModel.deletePlan(plan.subscriptionPlanId)
			}

			return html`
				<li ?data-active=${plan.active}>
					<div class=planinfo>
						<p class=label>${plan.label}</p>
						<div class=price>price: ${plan.price} cents</div>
						<div class=activity>
							<span class=activity-indicator>${plan.active ? "active" : "deactivated"}</span>
							<span class=activity-explainer>
								${plan.active
									? `plan is available for sale`
									: `plan has ended. all recurring billing has stopped. customers still have the permissions role they bought`}
							</span>
						</div>
						<div class=details>
							${renderIdentifier({
								label: "plan id",
								id: plan.subscriptionPlanId,
							})}
							${renderIdentifier({
								label: "role id",
								id: plan.roleId,
							})}
						</div>
					</div>
					<div class=plancontrols>
						${plan.active
							? html`
								<p>deactivation permanently ends recurring billing and prevents new purchases for this plan, but customers keep the permissions role they purchased</p>
								<p>this cannot be undone</p>
								<xio-button @press=${handleDeactivate}>deactivate</xio-button>
							`
							: html`
								<p>deletion permanently removes the permissions role, even for customers who purchased it</p>
								<p>this cannot be undone</p>
								<xio-button @press=${handleDelete}>delete</xio-button>
							`}
					</div>
				</li>
			`
		}

		return html`
			<ol class=plans>
				${plans.map(renderSinglePlan)}
			</ol>
		`
	}

	private renderCreator() {
		const {subscriptionPlanningModel} = this.share

		function handleChangeLabel({detail}: ValueChangeEvent<string>) {
			this.draft.label = detail
		}

		function handleChangePrice({detail}: ValueChangeEvent<number>) {
			this.draft.price = detail
		}

		function parsePrice(price: string) {
			return parseFloat(price) * 100
		}

		async function handleDraftSubmit() {
			await subscriptionPlanningModel.createPlan(this.draft)
		}

		return html`
			<div>
				<h3>create a new subscription plan</h3>

				<xio-text-input
					?show-validation-when-empty=${false}
					.validator=${() => []}
					@valuechange=${handleChangeLabel}>
						<span>plan label</span>
				</xio-text-input>

				<xio-text-input
					?show-validation-when-empty=${false}
					.validator=${() => []}
					.parser=${parsePrice}
					@valuechange=${handleChangePrice}>
						<span>plan price</span>
				</xio-text-input>

				<xio-button @press=${handleDraftSubmit}>
					create plan
				</xio-button>
			</div>
		`
	}

	render() {
		const {subscriptionPlanningModel, authModel} = this.share
		const mode = subscriptionPlanningModel.getSituationMode()
		switch (mode) {

			case PlanningSituation.Mode.StoreUninitialized:
				return html`
					<p class=warning>
						store is not initialized
					</p>
				`

			case PlanningSituation.Mode.LoggedOut:
				return html`
					<p class=warning>
						you must be logged in to plan subscriptions
					</p>
				`

			case PlanningSituation.Mode.Unprivileged:
				return html`
					<p class=warning>
						you're lacking privileges to plan subscriptions
					</p>
				`

			case PlanningSituation.Mode.Privileged:
				const {loadingPlans, loadingPlanCreation} =
					subscriptionPlanningModel.getLoadingViews()
				return renderWrappedInLoading(
					authModel.accessLoadingView,
					() => html`

						${renderWrappedInLoading(
							loadingPlans,
							plans => this.renderListOfSubscriptionPlans(plans)
						)}

						${renderWrappedInLoading(
							loadingPlanCreation,
							() => this.renderCreator()
						)}
					`
				)

			default:
				throw new Error("unknown planning situation mode")
		}
	}
}