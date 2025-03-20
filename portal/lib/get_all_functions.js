const getAllFunctions = (api) => ({
  async update_token(access_key, secret_key) {
    return api.update({
      url: `auth`,
      data: { access_key, secret_key },
    });
  },

  async get_seasons_data(sid = 0, args = {}) {
    const path = sid ? `seasons/${sid}/competitions` : `seasons`;
    return api.get({
      url: path,
      data: args,
    });
  },

  async get_competitions_data(cid = 0, args = {}) {
    const path = cid ? `competitions/${cid}` : `competitions`;
    return api.get({
      url: path,
      data: args,
    });
  },

  async get_matches_data(mid = 0, args = {}) {
    const path = mid ? `matches/${mid}/info` : `matches`;
    return api.get({
      url: path,
      data: args,
    });
  },

  async get_matches_scorecard(mid, args = {}) {
    const path = `matches/${mid}/scorecard`;
    return api.get({
      url: path,
      data: args,
    });
  },

  async get_teams_data(tid, args = {}) {
    const path = `teams/${tid}`;
    return api.get({
      url: path,
      data: args,
    });
  },
  async get_ipl_matches(args = {}) {
    const path = `competitions/127579/matches`;
    return api.get({
      url: path,
      data: args,
    });
  },
});

export default getAllFunctions;
