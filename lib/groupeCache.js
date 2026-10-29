const groupCache = {
  data: {},
  ttl: 300000,
  set(v1, v2) {
    this.data[v1] = {
      value: v2,
      expire: Date.now() + this.ttl,
    };
  },
  get(v1) {
    const v2 = this.data[v1];
    if (!v2) {
      return null;
    }
    if (Date.now() > v2.expire) {
      delete this.data[v1];
      return null;
    }
    return v2.value;
  },
  delete(v1) {
    delete this.data[v1];
  },
};
module.exports = {
  groupCache,
};
