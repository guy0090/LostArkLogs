export class TimeRangeQuery {
  public begin: number;
  public end: number;

  constructor(begin: number, end: number | undefined) {
    try {
      TimeRangeQuery.validate(begin, end);
      this.begin = begin;
      this.end = end || +new Date();
    } catch (err) {
      throw err;
    }
  }

  static validate(begin: number, end: number | undefined) {
    if (typeof begin !== 'number' || (end && typeof end !== 'number')) throw new Error('Invalid time range');
    else if (begin < 0) throw new Error('Invalid begin time');
    else if (end && end < begin) throw new Error('Invalid end time');
    else if (end && end - begin > 604800000) throw new Error('Time range too large');
  }
}
