import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import { useSingleCallResult } from 'lib/hooks/multicall'
import { useEffect, useMemo, useState } from 'react'
import referralmanagerABI from "constants/abi/referralmanagerABI.json";

import { useContract, useTokenContract } from './useContract'
import { useWeb3React } from '@web3-react/core'
import { useMyReferralAddress } from 'lib/hooks/useMyReferralAddress'
import { REFERRAL_MANAGER_ADDRESS } from 'constants/chains'

// returns undefined if input token is undefined, or fails to get token contract,
// or contract total supply cannot be fetched
export function useReferralData() {
  // const contract = useTokenContract(token?.isToken ? token.address : undefined, false)
  const { account, chainId: connectedChainId } = useWeb3React()
  const [myReferralStats, setBasicStats] = useState({
    referralCounts: "-",
    referralEarnings:"-",
    myReferre:"-"
  })

  const referralContract = useContract(REFERRAL_MANAGER_ADDRESS, referralmanagerABI, true)

  const loadMyReferralData = async () => {
    //@ts-ignore
    const myRefferalFromContract = await referralContract.referrers(account);
        //@ts-ignore

    const myRefferalCounts= await referralContract.referralsCount(account);

    setBasicStats({...myReferralStats,myReferre:myRefferalFromContract==="0x0000000000000000000000000000000000000000"?"-":myRefferalFromContract,referralCounts:myRefferalCounts.toNumber()})


  }

  useEffect(() => {
    if (account && referralContract) {
      loadMyReferralData()

    }
  },[account,connectedChainId,referralContract])


  return {myReferralStats}
}
