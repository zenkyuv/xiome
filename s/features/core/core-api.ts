
import {processPayloadTopic as process} from "renraku/dist/curries.js"

import {Rando} from "../../toolbox/get-rando.js"
import {ConstrainTables} from "../../toolbox/dbby/dbby-types.js"

import {prepareAuthProcessors} from "./auth-processors.js"
import {CoreTables, VerifyToken, VerifyGoogleToken, SignToken, RefreshToken, Scope, AccessPayload, PlatformConfig, RefreshPayload} from "./core-types.js"

import {signAuthTokens} from "./authtools/sign-auth-tokens.js"
import {fetchUserAndPermit} from "./authtools/fetch-user-and-permit.js"
import {assertGoogleAccount} from "./authtools/assert-google-account.js"
import {assertPasskeyAccount} from "./authtools/assert-passkey-account.js"

export function makeCoreApi({
			rando,
			config,
			signToken,
			verifyToken,
			constrainTables,
			generateNickname,
			verifyGoogleToken,
		}: {
			rando: Rando
			signToken: SignToken
			config: PlatformConfig
			verifyToken: VerifyToken
			generateNickname: () => string
			verifyGoogleToken: VerifyGoogleToken
			constrainTables: ConstrainTables<CoreTables>
		}) {

	const {
		authForApp,
		authForUser,
		authForRootUser,
	} = prepareAuthProcessors<CoreTables>({
		verifyToken,
		constrainTables,
	})

	return {

		authTopic: process(authForApp, {
			async authenticateViaPasskey(
						{tables},
						{passkey}: {passkey: string},
					) {
				const {userId} = await assertPasskeyAccount({tables, passkey})
				return signAuthTokens({
					userId,
					tables,
					scope: {core: true},
					lifespans: config.tokens.lifespans,
					signToken,
					generateNickname,
				})
			},
			async authenticateViaGoogle(
						{tables},
						{googleToken}: {googleToken: string},
					) {
				const googleResult = await verifyGoogleToken(googleToken)
				const {userId} = await assertGoogleAccount({rando, tables, googleResult})
				return signAuthTokens({
					userId,
					tables,
					scope: {core: true},
					lifespans: config.tokens.lifespans,
					signToken,
					generateNickname,
				})
			},
			async authorize(
						{tables},
						{scope, refreshToken}: {
							scope: Scope
							refreshToken: RefreshToken
						}
					) {
				const {userId} = await verifyToken<RefreshPayload>(refreshToken)
				const {user, permit} = await fetchUserAndPermit({userId, tables, generateNickname})
				return signToken<AccessPayload>({
					payload: {user, scope, permit},
					lifespan: config.tokens.lifespans.access,
				})
			},
		}),

		// authTopic: topic(authForApp, {
		// 	async authenticateViaPasskey({app, tables}, {passkey}: {passkey: string}) {
		// 		return {
		// 			accessToken: true,
		// 			refreshToken: true,
		// 		}
		// 	},
		// 	async authenticateViaGoogle({app, tables}, {googleToken}: {googleToken: string}) {
		// 		const tools = prepareAuthTools({rando, tables})
		// 		const {googleId, avatar: googleAvatar, name} = await verifyGoogleToken(googleToken)
		// 		const accountViaGoogle = await tools.findAccountViaGoogle(googleId)
		// 		const account = accountViaGoogle
		// 			? await tools.findAccount(accountViaGoogle.userId)
		// 			: await tools.registerViaGoogle({googleId, googleAvatar})
		// 		const user = await tools.findUser(account.userId)
		// 		const permit = await tools.findPermitFor(account.userId)
		// 		const scope: Scope = {core: true}
		// 		return concurrent({
		// 			accessToken: signToken<AccessPayload>({
		// 				payload: {user, permit, scope},
		// 				lifespan: config.tokens.lifespans.access,
		// 			}),
		// 			refreshToken: signToken<RefreshPayload>({
		// 				payload: {userId: user.userId},
		// 				lifespan: config.tokens.lifespans.refresh,
		// 			}),
		// 		})
		// 	},
		// 	async authorize({app, tables}, {refreshToken, scope}: {refreshToken: RefreshToken, scope: Scope}) {
		// 		// const {userId} = await verifyToken<RefreshPayload>(refreshToken)
		// 		// const user = await userLogin(userId)
		// 		// return signToken<AccessPayload>({
		// 		// 	payload: {user, scope},
		// 		// 	lifespan: accessTokenLifespan,
		// 		// })
		// 		return ""
		// 	},
		// }),

		// appsTopic: authProcessor.authForRootUser({
		// 	async listApps({app, access, tables}, o: {
		// 			userId: string
		// 		}) {},
		// 	async registerApp({app, access, tables}, o: {
		// 			userId: string
		// 			appDraft: any
		// 		}) {},
		// 	async deleteApp({app, access, tables}, o: {
		// 			userId: string
		// 			appId: string
		// 		}) {},
		// 	async createAppToken({app, access, tables}, o: {
		// 			userId: string
		// 			appId: string
		// 			appTokenDraft: any
		// 		}) {},
		// 	async deleteAppToken({app, access, tables}, o: {
		// 			userId: string
		// 			appTokenId: string
		// 		}) {},
		// }),

		// userTopic: authProcessor.authForUser({
		// 	async getUser({app, access, tables}, {userId}: {userId: string}) {
		// 		// return fetchUser(userId)
		// 	},
		// 	async setUserProfile({app, access, tables}, {userId, profile}: {userId: string, profile: Profile}) {
		// 		// const askingUser = await verifyScope(accessToken)
		// 		// const allowed = false
		// 		// 	|| askingUser.claims.admin
		// 		// 	|| askingUser.userId === userId
		// 		// if (!allowed) throw new Error("forbidden")
		// 		// const {problems} = validateProfile(profile)
		// 		// if (problems.length) throw new Error(`invalid profile: ${problems.join("; ")}`)
		// 		// await profileTable.update({
		// 		// 	conditions: and({equal: {userId}}),
		// 		// 	write: profile,
		// 		// })
		// 	},
		// }),
	}
}

	// async function verifyScope(accessToken: AccessToken): Promise<User> {
	// 	const {user, scope} = await verifyToken<AccessPayload>(accessToken)
	// 	if (!scope.core) throw new Error("forbidden scope")
	// 	return user
	// }

	// function assembleUser({
	// 		accountRow,
	// 		claimsRow,
	// 		profileRow,
	// 	}: {
	// 		accountRow: AccountRow
	// 		claimsRow: ClaimsRow
	// 		profileRow: ProfileRow
	// 	}) {
	// 	const {userId: noop1, ...claims} = claimsRow
	// 	const {userId: noop2, ...profile} = profileRow
	// 	const {userId} = accountRow
	// 	return <U>{userId, claims, profile}
	// }

	// async function fetchUser(userId: string): Promise<U> {
	// 	const userIdConditions = {conditions: and({equal: {userId}})}
	// 	const accountRow = await accountTable.one(userIdConditions)
	// 	return assembleUser({
	// 		accountRow,
	// 		...await concurrent({
	// 			claimsRow: claimsTable.one(userIdConditions),
	// 			profileRow: profileTable.one(userIdConditions),
	// 		}),
	// 	})
	// }

	// async function assertUser({avatar, accountRow}: {
	// 		avatar: string
	// 		accountRow: AccountRow
	// 	}) {
	// 	const {userId} = accountRow
	// 	const userIdConditions = {conditions: and({equal: {userId}})}
	// 	return assembleUser({
	// 		accountRow,
	// 		...await concurrent({
	// 			claimsRow: claimsTable.assert({
	// 				...userIdConditions,
	// 				make: async() => ({
	// 					userId,
	// 					admin: false,
	// 					staff: false,
	// 					joined: Date.now(),
	// 					banUntil: undefined,
	// 					banReason: undefined,
	// 					premiumUntil: undefined,
	// 				}),
	// 			}),
	// 			profileRow: profileTable.assert({
	// 				...userIdConditions,
	// 				make: async() => ({
	// 					userId,
	// 					avatar,
	// 					tagline: "",
	// 					nickname: generateNickname(),
	// 				}),
	// 			}),
	// 		}),
	// 	})
	// }

	// async function updateClaims(
	// 		userId: string,
	// 		claims: Partial<U["claims"]>
	// 	) {
	// 	await claimsTable.update({
	// 		conditions: and({equal: {userId}}),
	// 		write: claims,
	// 	})
	// }

	// async function userLogin(userId: string) {
	// 	const user = await fetchUser(userId)
	// 	const claims = {...user.claims}
	// 	await updateClaims(userId, claims)
	// 	user.claims = claims
	// 	return user
	// }
