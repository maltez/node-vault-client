const fs = require('fs');
const VaultBaseAuth = require('./VaultBaseAuth');

class VaultKubernetesAuth extends VaultBaseAuth {
    /**
     * @param {VaultApiClient} apiClient - see {@link VaultBaseAuth#constructor}
     * @param {Object} config
     * @param {String} config.role - Role of the Kubernetes.
     * @param {String} [config.jwt] - Your service jwt token.
     * @param {String} mount - Vault's  mount point ("kubernetes" by default)
     */
    constructor(apiClient, logger, config, mount) {
        super(apiClient, logger, mount || 'kubernetes');

        this.__role = config.role;
        this.__filePath = '/var/run/secrets/kubernetes.io/serviceaccount/token';
    }

    _authenticate() {
        this._log.info(
            'making authentication request: role_id=%s',
            this.__roleId,
        );

        return Promise.resolve(fs.readFileSync(this.__filePath).toString())
            .then((jwt) => {
                console.log(`File is contains token ${jwt}`)
                return this.__apiClient.makeRequest('POST', `/auth/${this._mount}/login`, {
                    role: this.__role,
                    jwt,
                });
            })
            .then((res) => {
                this._log.debug(
                    'receive token: %s',
                    res.auth.client_token,
                );
                return this._getTokenEntity(res.auth.client_token);
            });
    }
}

module.exports = VaultKubernetesAuth;
