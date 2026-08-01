export const environment = {
  production: false,
  /**
   * Set to true to point Angular web frontend directly to Render backend.
   * Set to false to point to local Spring Boot (http://localhost:8080/api).
   */
  useRenderBackend: true,

  localApiUrl: 'http://localhost:8080/api',
  renderApiUrl: 'https://grame-one-back-end.onrender.com/api',

  get apiUrl(): string {
    return this.useRenderBackend ? this.renderApiUrl : this.localApiUrl;
  }
};
