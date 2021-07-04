
import styles from "./xiome-login-panel.css.js"
import {Op, ops} from "../../../../framework/ops.js"
import {email} from "../../../../toolbox/darkvalley.js"
import {AuthModel} from "../../models/types/auth/auth-model.js"
import {AccessPayload} from "../../types/tokens/access-payload.js"
import {renderOp} from "../../../../framework/op-rendering/render-op.js"
import {XioTextInput} from "../../../xio-components/inputs/xio-text-input.js"
import {Component2WithShare, html, mixinStyles, property, query} from "../../../../framework/component2/component2.js"

@mixinStyles(styles)
export class XiomeLoginPanel extends Component2WithShare<{authModel: AuthModel}> {

	@property({type: Boolean, reflect: true})
	["show-logout"]: boolean = false

	@property()
	private sentLoading: Op<{email: string}> = ops.none()

	@query("xio-text-input")
	private textInput: XioTextInput

	@property({type: String})
	private emailIsValid = false

	private async sendEmail() {
		const email = this.textInput.value
		await ops.operation({
			promise: this.share.authModel.sendLoginLink(email)
				.then(() => ({email})),
			setOp: op => this.sentLoading = op,
			errorReason: `failed sending email to "${email}"`,
		})
	}

	private resetSentLoading() {
		this.sentLoading = ops.none()
		if (this.textInput)
			this.textInput.text = ""
	}

	private logout() {
		this.share.authModel.logout()
			.then(() => this.sentLoading = ops.none())
	}

	subscribe() {
		return this.share.authModel.onAccessChange(() => {
			this.resetSentLoading()
		})
	}

	private renderLoggedIn(access: AccessPayload) {
		return html`
			<slot>
				<p>Welcome ${access.user.profile.nickname}!</p>
			</slot>
			${this["show-logout"]
				? html`
					<div part=buttonbar>
						<xio-button class=logout-button @press=${this.logout}>
							Logout
						</xio-button>
					</div>
				`
				: null}
		`
	}

	private handleEmailChange() {
		this.emailIsValid = this.textInput.problems.length === 0
	}

	private renderLegalLink() {
		return html`
			<small>
				<p>
					<a
						part=link
						target=_blank
						href="https://xiome.io/legal">
							policies and terms
					</a>
				</p>
			</small>
		`
	}

	private renderLoggedOut() {
		const {emailIsValid} = this
		return html`
			<xio-op .op=${this.sentLoading}>
				<div slot=none>
					<slot name=logged-out>
						<p>login with your email address</p>
					</slot>
					<xio-text-input
						.validator=${email()}
						@valuechange=${this.handleEmailChange}
						@enterpress=${this.sendEmail}>
							your email
					</xio-text-input>
					<slot name=legal>
						${this.renderLegalLink()}
					</slot>
					<xio-button
						?disabled=${!emailIsValid}
						@press=${this.sendEmail}>
							send login link
					</xio-button>
				</div>
				${ops.isReady(this.sentLoading)
					? html`
						<p>email sent to ${ops.value(this.sentLoading).email}</p>
						<xio-button @press=${this.resetSentLoading}>
							try another address?
						</xio-button>
					`
					: null}
			</xio-op>
		`
	}

	render() {
		const {access: accessOp} = this.share.authModel
		return renderOp(accessOp, access => access?.user
			? this.renderLoggedIn(access)
			: this.renderLoggedOut()
		)
	}
}
