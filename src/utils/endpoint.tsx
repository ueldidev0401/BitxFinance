export const endpointAccountToken = (apiAddress: string, walletAddress: string, tokenIdentifier: string) => {
    const endpoint = `${apiAddress}/accounts/${walletAddress}/tokens/${tokenIdentifier}`;
    return endpoint;
};