
import {SystemRemote} from "./system-remote.js"
import {AuthGoblin} from "../../../features/auth/goblin/types/auth-goblin.js"

export interface FrontendOptions {
	link: string
	remote: SystemRemote
	authGoblin: AuthGoblin
}
