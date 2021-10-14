
import {Question} from "../../../api/types/questions-and-answers.js"

export function sortQuestions(
		questions: Question[],
		myUserId?: string
	) {

	const myQuestions: Question[] = []
	const otherQuestions: Question[] = []

	for (const question of questions) {
		const isMine = myUserId && question.authorUserId === myUserId
		if (isMine)
			myQuestions.push(question)
		else
			otherQuestions.push(question)
	}

	function byLikeAndTime(likes: number, timePosted: number) {
		if (likes === 0)
			likes = 1
		return likes * (1 / (1 + Date.now() - timePosted))
	}

	const sort = (a: Question, b: Question) => {
		const promote = {a: -1, b: 1}
		const scoreA = byLikeAndTime(a.likes, a.timePosted)
		const scoreB = byLikeAndTime(b.likes, b.timePosted)

		if (scoreA > scoreB) return promote.a
		if (scoreB > scoreA) return promote.b

		if (a.liked == true && b.liked == false) return promote.a
		if (b.liked == true && a.liked == false) return promote.b

		if (a.reports < b.reports) return promote.a
		if (a.reports > b.reports) return promote.b

		return 0
	}

	return [
		...myQuestions.sort(sort),
		...otherQuestions.sort(sort),
	]
}
