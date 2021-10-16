
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
	class RedditScore {
  private epoch: Date;
  private base: number = 1134028003; // 8th December 2005 7:46:43 AM UTC

  constructor(base?: number) {
    this.epoch = new Date(1970, 1, 1);

    if (base) {
      this.base = base;
    }
  }

		public hot(ups: number, date): number {
			// const likeIsWorth = ups * day + date;
    const score = this.score(ups) * day;
    const order = this.order(score);
    const sign = this.sign(score);
    const seconds = this.seconds(date) - this.base;

    // calc the result
    const result = sign * order + seconds / 45000;

    // rounds to 7th decimal
    return Math.round(Math.pow(10, 7) * result) / Math.pow(10, 7);
  }

  public score(ups: number): number {
		return ups;
  }

  private order(score: number): number {
    return this.log10(Math.max(Math.abs(score), 1));
  }

  private sign(score: number): number {
    if (score > 0) {
      return 1;
    }

    if (score < 0) {
      return -1;
    }

    return 0;
  }

  private seconds(date: Date): number {
    const td = date.getTime() - this.epoch.getTime();

    return Math.abs(td / 1000);
  }

  private log10(value: number): number {
    return Math.log(value) / Math.LN10;
  }
}
	const reddit = new RedditScore();
	function byLikeTimeReport(likes, timePosted, report) {
		const likeIsWorth = likes * day + timePosted;
		const reportedWorth = timePosted - day;
		if (report === false) {
			return likeIsWorth;
		} else if (report === true) {
			return reportedWorth;
		}
	}

	const sort = (a: Question, b: Question) => {
		const promote = {a: -1, b: 1}
		const scoreA = reddit.hot(a.likes,new Date(a.timePosted))
		const scoreB = reddit.hot(b.likes,new Date(b.timePosted))

		if (scoreA > scoreB && scoreA - scoreB !< day) return promote.a
		if (scoreB > scoreA && scoreB - scoreA !< day) return promote.b

	

		if (a.liked == true && b.liked == false) return promote.a
		if (b.liked == true && a.liked == false) return promote.b

		if (a.reports < b.reports) return promote.a
		if (a.reports > b.reports) return promote.b
		// idk if i should remove these above at all, its working for now,
		// but not gonna remove it till it gonna pass Chase(pro, expert) review :D

		return 0
	}

	return [
		...myQuestions.sort(sort),
		...otherQuestions.sort(sort),
	]
}
