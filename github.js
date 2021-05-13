// Old OAuth method - now deprecated
/* class Github {
  constructor() {
    this.client_id = '3e5ad00b5c052dd8bf7c';
    this.client_secret = 'de42347e57f78fbe3217900751206abb06ef7f58';
  }

  async getUser(user) {
    const profileResponse = await fetch(
      `https://api.github.com/users/${user}?client_id=${this.client_id}&client_secret=${this.client_secret}`
    );

    const profile = await profileResponse.json();

    return {
      profile,
    };
  }
} */

// New PAT method
class Github {
  constructor() {
    this.config = {
      headers: {
        Authorization: 'token INSERT_TOKEN_HERE',
      },
    };
    this.repos_count = 8;
    this.repos_sort = 'created: asc';
  }
  async getUser(user) {
    // cache the user so if we get a bad response we show the last 'good' user
    let cachedUser = {};

    const profileResponse = fetch(
      `https://api.github.com/users/${user}`,
      this.config
    );

    const repoResponse = fetch(
      `https://api.github.com/users/${user}/repos?per_page=${this.repos_count}&sort=${this.repos_sort}`,
      this.config
    );

    // concurrently fetch profile and repos
    const responses = await Promise.all([profileResponse, repoResponse]);

    // check response was good
    if (responses.every((res) => res.ok)) {
      const [profile, repos] = await Promise.all(
        responses.map((promise) => promise.json())
      );
      cachedUser = { profile, repos };
    } else {
      cachedUser.message = 'User Not Found';
    }

    return cachedUser;
  }
}
