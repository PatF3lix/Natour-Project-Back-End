class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    //1A) filtering
    const queryObj = { ...this.queryString };
    //filtering url queries, in order to exclude certain fields from the queries
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);
    //1B) advanced filtering
    let queryStr = JSON.stringify(queryObj);
    //replacing the gte,gt,lte,lt in query query string with the mondodb var $gte,$gt,$lte,$lt
    //using a regular expression
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      //this permits the user to sort by more than one field
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      //default
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      //this is called projecting
      this.query = this.query.select(fields);
    } else {
      //default putting the '-'in front of a property will exclude it
      //__v is a property used by mongodb, not usefull for the client
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    //using the || operator to short circuit and set a default;, '* 1' in order to change string to number
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    /**limit: exactly the same as the limit that we defined in the quey string.
     * Skip: the amount of results that should be skipped before actually querying data.
     */
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
