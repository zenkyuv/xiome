
import {Question} from "../../../api/types/questions-and-answers.js"
import {day} from "../../../../../toolbox/goodtimes/times.js"
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

	function byLikeTimeReport(likes, timePosted, report) {
		const likeIsWorth = likes * day + timePosted;
		const reported = timePosted - day;
		if (likeIsWorth && report === false) {
			return likeIsWorth;
		} else if (report === true) {
			return reported;
		}
	}

	const sort = (a: Question, b: Question) => {
		const promote = {a: -1, b: 1}
		const scoreA = byLikeTimeReport(a.likes, a.timePosted, a.reported)
		const scoreB = byLikeTimeReport(b.likes, b.timePosted, b.reported)

		if (scoreA > scoreB) return promote.a
		if (scoreB > scoreA) return promote.b

		if (a.liked == true && b.liked == false) return promote.a
		if (b.liked == true && a.liked == false) return promote.b

		// if (a.reports < b.reports) return promote.a
		// if (a.reports > b.reports) return promote.b
		// idk if i should remove these above at all, its working for now,
		// but not gonna remove it till it gonna pass Chase(pro, expert) review :D

		return 0
	}

	return [
		...myQuestions.sort(sort),
		...otherQuestions.sort(sort),
	]
}
