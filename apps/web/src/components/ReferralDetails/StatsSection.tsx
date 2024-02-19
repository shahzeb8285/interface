import { Trans } from '@lingui/macro'
import { ChainId } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { useToggleAccountDrawer } from 'components/AccountDrawer/MiniPortfolio/hooks'
import { ButtonLight, ButtonSize } from 'components/Button'
import { MouseoverTooltip } from 'components/Tooltip'
import { getChainInfo } from 'constants/chainInfo'
import { useInfoTDPEnabled } from 'featureFlags/flags/infoTDP'
import { TokenQueryData } from 'graphql/data/Token'
import { useReferralData } from 'hooks/useReferralData'
import { ReactNode, useCallback, useMemo, useState } from 'react'
import { useAddPopup, useShowClaimPopup, useToggleSelfClaimModal, useToggleSettingsMenu, useToggleShowClaimPopup } from 'state/application/hooks'
import { PopupType, addPopup } from 'state/application/reducer'
import styled from 'styled-components'
import { ExternalLink, ThemedText } from 'theme/components'
import { textFadeIn } from 'theme/styles'
import { shortenAddress } from 'utils'
import { NumberType, useFormatter } from 'utils/formatNumbers'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { Hr } from './shared'
import { Table } from 'components/Table'
import { createColumnHelper } from '@tanstack/react-table'
import { Cell } from 'components/Table/Cell'
import useReferralComissionQueryQuery from 'hooks/Referral'
import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'
import { BigNumber, ethers } from 'ethers'
import { MAX_WIDTH_MEDIA_BREAKPOINT } from 'components/Tokens/constants'

// import { UNSUPPORTED_METADATA_CHAINS } from '../constants'
// import { TokenSortMethod } from '../state'
// import { HEADER_DESCRIPTIONS } from '../TokenTable/TokenRow'

export const StatWrapper = styled.div<{ isInfoTDPEnabled?: boolean }>`
  color: ${({ theme }) => theme.neutral2};
  font-size: 14px;
  min-width: 121px;
  flex: 1;
  padding-top: 24px;
  padding-bottom: ${({ isInfoTDPEnabled }) => (isInfoTDPEnabled ? '0px' : '24px')};

  @media screen and (max-width: ${({ theme }) => theme.breakpoint.sm}px) {
    min-width: 168px;
  }
`
const TokenStatsSection = styled.div`
  display: flex;
  flex-wrap: wrap;
`
export const StatPair = styled.div`
  display: flex;
  flex: 1;
  flex-wrap: wrap;
`

const Header = styled(ThemedText.MediumHeader) <{ isInfoTDPEnabled?: boolean }>`
  font-size: 28px !important;
  padding-top: ${({ isInfoTDPEnabled }) => (isInfoTDPEnabled ? '40' : '24')}px;
`

const StatPrice = styled.div`
  margin-top: 4px;
  font-size: 28px;
  color: ${({ theme }) => theme.neutral1};
`
const NoData = styled.div<{ isInfoTDPEnabled?: boolean }>`
  color: ${({ theme }) => theme.neutral3};
  ${({ isInfoTDPEnabled }) => isInfoTDPEnabled && 'padding-top: 40px;'}
`
export const StatsWrapper = styled.div`
  gap: 16px;
  ${textFadeIn}
`

type NumericStat = number | undefined | null

function Stat({
  dataCy,
  value,
  isSmall = false,
  title,
  description,
}: {
  dataCy: string
  value: any
  isSmall?: boolean
  title: ReactNode
  description?: ReactNode
}) {
  const isInfoTDPEnabled = useInfoTDPEnabled()

  return (
    <StatWrapper data-cy={`${dataCy}`} isInfoTDPEnabled={isInfoTDPEnabled}>
      <MouseoverTooltip text={description}>{title}</MouseoverTooltip>
      <StatPrice style={{
        fontSize: isSmall ? 14 : 28
      }}>
        {value}
      </StatPrice>
    </StatWrapper>
  )
}



function MyReferralLink() {
  const { account, chainId: connectedChainId } = useWeb3React()
  const toggleWalletDrawer = useToggleAccountDrawer() // toggle wallet when disconnected


  const handleCopyReferralLink = () => {
    const refLink = `${window.location.origin}?seeder=${account}`
    const input = document.createElement('input');
    input.setAttribute('value', refLink);
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    alert("Referral Link Copied")

    // addPopup({ type: PopupType.Transaction, hash: "Ppzpa" }, "papa", 5000)

  }

  const handleCopyTgReferralLink = () => {
    const refLink = `${window.location.origin}?seeder=${account}`
    const input = document.createElement('input');
    input.setAttribute('value', refLink);
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    alert("Referral Link Copied")

    // addPopup({ type: PopupType.Transaction, hash: "Ppzpa" }, "papa", 5000)

  }
  return (

    <div style={{width:"100%"}}>
      <ButtonLight size={ButtonSize.large} onClick={() => {
        if (account) {
          handleCopyReferralLink()
        } else {
          toggleWalletDrawer()

        }
      }} fontWeight={20} fontSize={12} $borderRadius="16px" >
        {account ? " Seeding Link" : "Connect"}
      </ButtonLight>
      {account && <ButtonLight size={ButtonSize.large} marginTop={1} onClick={() => {
        handleCopyTgReferralLink()

      }} fontWeight={20} fontSize={12} $borderRadius="16px" >
        Telegram Link
      </ButtonLight>}
    </div>
  )
}

interface ReferralTableValues {
  index: number
  tokenAddress: string
  amount: string
  fromAddress: string
  tokenSymbol: string
  tokenDecimal: string
  timestamp: string
  transactionHash: string
}



const timestampToTime = (timestamp: string) => {
  const date = new Date(Number(timestamp) * 1000);
  const day = String(date.getDate()).padStart(2, '0');
  const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // 12-hour clock, so 0 becomes 12
  const timeString = `${hours}:${minutes} ${ampm}`;
  return `${day} ${month} ${year} ${timeString}`;
}


const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`

const TableWrapper = styled.div`
  margin: 0 auto;
  max-width: ${MAX_WIDTH_MEDIA_BREAKPOINT};
`
export function ComissionTable() {
  const { chainId: connectedChainId, account } = useWeb3React()

  //@ts-ignore
  const { data } = useReferralComissionQueryQuery(account ? account : "", connectedChainId)

  const tableColumns = useMemo(() => {
    const columnHelper = createColumnHelper<ReferralTableValues>()
    return [

      columnHelper.accessor((row) => row.timestamp, {
        id: 'timestamp',
        header: () => (
          <Cell justifyContent="flex-start" width={240} grow>
            <ThemedText.BodySecondary>
              Date
            </ThemedText.BodySecondary>
          </Cell>
        ),
        cell: (timestamp) => (
          <Cell justifyContent="flex-start" width={240} grow>
            {timestampToTime(timestamp.getValue?.())}
          </Cell>
        ),
      }),


      columnHelper.accessor((row) => row.tokenSymbol, {
        id: 'tokenSymbol',
        header: () => (
          <Cell justifyContent="flex-start" width={240} grow>
            <ThemedText.BodySecondary>
              Token
            </ThemedText.BodySecondary>
          </Cell>
        ),
        cell: (tokenSymbol) => (
          <Cell justifyContent="flex-start" width={240} grow>
            {tokenSymbol.getValue?.()}
          </Cell>
        ),
      }),

      columnHelper.accessor((row) => row.transactionHash, {
        id: 'transaction',
        header: () => (
          <Cell justifyContent="flex-start" width={240} grow>
            <ThemedText.BodySecondary>
              Transaction
            </ThemedText.BodySecondary>
          </Cell>
        ),
        cell: (hash) => {

          const rawHash = hash.getValue?.()
          const finalHash = `${rawHash.slice(0, 5)}....${rawHash.slice(rawHash.length - 5, rawHash.length)}`
          return <Cell justifyContent="flex-start" width={240} grow>
            <ExternalLink href={getExplorerLink(connectedChainId ? connectedChainId : 1, hash.getValue?.(), ExplorerDataType.TRANSACTION)}>
              {finalHash}
            </ExternalLink>
          </Cell>
        },
      }),

      columnHelper.accessor((row) => row, {
        id: 'from',
        header: () => (
          <Cell justifyContent="flex-start" width={240} grow>
            <ThemedText.BodySecondary>
              From
            </ThemedText.BodySecondary>
          </Cell>
        ),
        cell: (row) => {
          const fromAddress = row.row.original.fromAddress
          return <Cell justifyContent="flex-start" width={240} grow>
            <ExternalLink href={getExplorerLink(connectedChainId ? connectedChainId : 1, fromAddress, ExplorerDataType.ADDRESS)}>
              {shortenAddress(fromAddress)}
            </ExternalLink>
          </Cell>
        },
      }),

      columnHelper.accessor((row) => row, {
        id: 'amount',
        header: () => (
          <Cell justifyContent="flex-start" width={240} grow>
            <ThemedText.BodySecondary>
              Amount
            </ThemedText.BodySecondary>
          </Cell>
        ),
        cell: (row) => {

          const amount = row.row.original.amount
          const decimal = Number(row.row.original.tokenDecimal);
          const finalTokenAmount = ethers.utils.formatUnits(amount, decimal).toString()
          return <Cell justifyContent="flex-start" width={240} grow>
            {Number(finalTokenAmount).toFixed(6)}
          </Cell>
        },
      }),

    ]
  }, [])

  return <TableWrapper style={{
    overflow:"hidden"
  }}>
    <Table columns={tableColumns}
      //@ts-ignore
      data={data ? data.comissionItems : []} />

  </TableWrapper>

}

export default function StatsSection() {

  const { chainId: connectedChainId, account } = useWeb3React()
  const { myReferralStats } = useReferralData()





  return (
    <Container>
      <StatsWrapper data-testid="token-details-stats">
        <Header isInfoTDPEnabled={true}>
          Seeding Details
        </Header>
        <TokenStatsSection>
          <Container>
            <Stat
              dataCy="Seeding System"
              isSmall
              value={" when an unknown printer took a galley oft"}

              description={" text ever since the 1500s, when an unknown printer took a galley oft"}
              title="Seeding System "

            />

            <StatPair >

              <Stat
                dataCy="Your Seeding Count"
                value={myReferralStats.referralCounts}
                description={"Your Seeding Count"}
                title="Your Seeding Count"

              />
              {/* <Stat
              dataCy="your-referral-earnings"
              value={"134"}

              description={
                "Your Referral Earnings"
              }
              title="Your Referral Earnings"

            /> */}


              {/* <Stat

                dataCy="Your Referrer"
                value={<ExternalLink
                  disabled={myReferralStats.myReferre == "-"}
                  href={getExplorerLink(connectedChainId ? connectedChainId : 1, myReferralStats.myReferre, ExplorerDataType.ADDRESS)} >
                  {myReferralStats.myReferre == "-" ? myReferralStats.myReferre : shortenAddress(myReferralStats.myReferre)}
                </ExternalLink>
                }
                description="Your Referrer"
                title="Your Referrer"
              /> */}
              <Stat
                dataCy="your-referral-earnings"
                value={<MyReferralLink />}

                description={
                  "Your Seeding Link"
                }
                title="Copy Your Seeding Link"

              />

            </StatPair>



          </Container>
        </TokenStatsSection>
      </StatsWrapper>
      <Hr />


      {account && connectedChainId && <ComissionTable />}

    </Container>

  )
}


