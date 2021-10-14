
import {Suite, expect} from "cynic"
import {sortQuestions} from "./sort-questions.js"
import {day} from "../../../../../toolbox/goodtimes/times.js"
import {Question} from "../../../api/types/questions-and-answers.js"

export default <Suite>{
	async "input length should equal output length"() {
		const {fakeQuestion} = fakeQuestionSession()
		const output = sortQuestions([
			fakeQuestion(),
			fakeQuestion(),
		])
		expect(output.length).equals(2)
	},
	async "liked question is promoted"() {
		const {fakeQuestion} = fakeQuestionSession()
		const output = sortQuestions([
			fakeQuestion({
				liked: false,
				likes: 0,
			}),
			fakeQuestion({
				liked: true,
				likes: 1,
			}),
		])
		expect(output[0].liked).equals(true)
	},
	async "newer question is promoted"() {
		const {fakeQuestion} = fakeQuestionSession()
		const now = Date.now()
		const oneDayAgo = now - (1 * day)
		const twoDaysAgo = now - (2 * day)
		const output = sortQuestions([
			fakeQuestion({
				authorUserId: "a",
				timePosted: twoDaysAgo,
			}),
			fakeQuestion({
				authorUserId: "b",
				timePosted: oneDayAgo,
			}),
		])
		expect(output[0].authorUserId).equals("b")
	},
	async "reported questions are demoted"() {
		const {fakeQuestion} = fakeQuestionSession()
		const output = sortQuestions([
			fakeQuestion({
				reported: true,
				reports: 1,
			}),
			fakeQuestion({
				reported: false,
				reports: 0,
			}),
		])
		expect(output[0].reported).equals(false)
	},
	async "user's own questions are always on top"() {
		const {fakeQuestion} = fakeQuestionSession()
		const me = "me"
		const now = Date.now()
		const oneDayAgo = now - (1 * day)
		const twoDaysAgo = now - (2 * day)
		const output = sortQuestions([
			fakeQuestion({
				timePosted: oneDayAgo,
				likes: 10,
				liked: true,
			}),
			fakeQuestion({
				authorUserId: me,
				timePosted: twoDaysAgo,
			}),
		], me)
		expect(output[0].authorUserId).equals(me)
	},
	async "complex data"() {
		const {fakeQuestion} = fakeQuestionSession()
		const now = Date.now()
		const oneDayAgo = now - (1 * day)
		const nineDaysAgo = now - (9 * day)
		const tenDaysAgo = now - (10 * day)
		const oneYearAgo = now - (365 * day)
		const input: Question[] = [
			fakeQuestion({
				authorUserId: "old",
				timePosted: oneYearAgo,
				likes: 10,
				liked: true,
			}),
			fakeQuestion({
				authorUserId: "middle-a",
				timePosted: tenDaysAgo,
				likes: 5,
				liked: true,
			}),
			fakeQuestion({
				authorUserId: "middle-b",
				timePosted: nineDaysAgo,
			}),
			fakeQuestion({
				authorUserId: "new",
				timePosted: oneDayAgo,
			}),
		]
		return {
			async "old questions are ranked low despite likes"() {
				const output = sortQuestions(input)
				expect(output[0].authorUserId).equals("new")
			},
			async "likes can promote questions near in time"() {
				const output = sortQuestions(input)
				const getIndex = (id: string) => output.indexOf(
					output.find(q => q.authorUserId === id)
				)
				const middle_a = getIndex("middle-a")
				const middle_b = getIndex("middle-b")
				expect(middle_a < middle_b).ok()
			},
		}
	},
}

function fakeQuestionSession() {
	let count = 0
	return {
		fakeQuestion(details?: Partial<Question>) {
			count += 1
			return {
				answers: [],
				archive: false,
				authorUserId: "",
				board: "default",
				content: "Hello this is a question!",
				liked: false,
				likes: 0,
				questionId: "",
				reported: false,
				reports: 0,
				timePosted: Date.now() - count,
				...details,
			}
		}
	}
}
