import { ChainId } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { DEPRECATED_RPC_PROVIDERS, RPC_PROVIDERS } from 'constants/providers'
import { useFallbackProviderEnabled } from 'featureFlags/flags/fallbackProvider'
import { useContract } from 'hooks/useContract'
import useIsWindowVisible from 'hooks/useIsWindowVisible'
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import referralmanagerABI from "constants/abi/referralmanagerABI.json";
import { REFERRAL_MANAGER_ADDRESS } from 'constants/chains'
import { ethers } from 'ethers'



export const useMyReferralAddress =  () => {
  const [referralAddress,setReferralAddress]= useState("0x0000000000000000000000000000000000000000")
  const { account: walletAddress } = useWeb3React()

  const referralContract = useContract(REFERRAL_MANAGER_ADDRESS, referralmanagerABI, true)
  const loadReferral = async () => {
    //@ts-ignore
    const myRefferalFromContract = await referralContract.referrers(walletAddress);
    const myRefferalFromDb =  localStorage.getItem("referrer")
    if (myRefferalFromContract === "0x0000000000000000000000000000000000000000" && myRefferalFromDb && ethers.utils.isAddress(myRefferalFromDb)) {
      setReferralAddress(myRefferalFromDb)
    } else {
      setReferralAddress(myRefferalFromContract)
    }

  }

  useEffect(() => {
    if (referralContract && walletAddress) {
      loadReferral()
    }

  }, [referralContract,walletAddress])

  return {referralAddress}
}
