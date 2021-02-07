import { AppTokenDraft } from "../../../../auth-types"

export interface TokenManagerOptions {
	root: ShadowRoot | HTMLElement
	requestUpdate: () => void
	createToken: (draft: AppTokenDraft) => Promise<void>
	deleteToken: (appTokenId: string) => Promise<void>
}