import invariant from 'tiny-invariant'
import { Interface } from '@ethersproject/abi'
import { BigNumber, BigNumberish, ethers } from 'ethers'
import { MethodParameters } from '@uniswap/v3-sdk'
import { Trade as RouterTrade,  SwapOptions as RouterSwapOptions,
} from '@uniswap/router-sdk'
import { Currency, Percent, TradeType } from '@uniswap/sdk-core'
import { Command, Market, NFTTrade, RouterTradeType, SeaportTrade, SupportedProtocolsData, UniswapTrade } from '@uniswap/universal-router-sdk'

import { UnwrapWETH} from '@uniswap/universal-router-sdk/dist/entities/protocols'
import { CustomRoutePlanner } from './customRouteplanner'
import { PermitSingle } from '@uniswap/permit2-sdk'
import { CustomUniswapTrade } from './customUniversalTrade'
const abi =  [
  {
      "type": "constructor",
      "inputs": [
          {
              "name": "params",
              "type": "tuple",
              "internalType": "struct RouterParameters",
              "components": [
                  {
                      "name": "permit2",
                      "type": "address",
                      "internalType": "address"
                  },
                  {
                      "name": "weth9",
                      "type": "address",
                      "internalType": "address"
                  },
                  {
                      "name": "seaportV1_5",
                      "type": "address",
                      "internalType": "address"
                  },
                  {
                      "name": "seaportV1_4",
                      "type": "address",
                      "internalType": "address"
                  },
                  {
                      "name": "openseaConduit",
                      "type": "address",
                      "internalType": "address"
                  },
                  {
                      "name": "nftxZap",
                      "type": "address",
                      "internalType": "address"
                  },
                  {
                      "name": "x2y2",
                      "type": "address",
                      "internalType": "address"
                  },
                  {
                      "name": "foundation",
                      "type": "address",
                      "internalType": "address"
                  },
                  {
                      "name": "sudoswap",
                      "type": "address",
                      "internalType": "address"
                  },
                  {
                      "name": "elementMarket",
                      "type": "address",
                      "internalType": "address"
                  },
                  {
                      "name": "nft20Zap",
                      "type": "address",
                      "internalType": "address"
                  },
                  {
                      "name": "cryptopunks",
                      "type": "address",
                      "internalType": "address"
                  },
                  {
                      "name": "looksRareV2",
                      "type": "address",
                      "internalType": "address"
                  },
                  {
                      "name": "routerRewardsDistributor",
                      "type": "address",
                      "internalType": "address"
                  },
                  {
                      "name": "looksRareRewardsDistributor",
                      "type": "address",
                      "internalType": "address"
                  },
                  {
                      "name": "looksRareToken",
                      "type": "address",
                      "internalType": "address"
                  },
                  {
                      "name": "v2Factory",
                      "type": "address",
                      "internalType": "address"
                  },
                  {
                      "name": "v3Factory",
                      "type": "address",
                      "internalType": "address"
                  },
                  {
                      "name": "pairInitCodeHash",
                      "type": "bytes32",
                      "internalType": "bytes32"
                  },
                  {
                      "name": "poolInitCodeHash",
                      "type": "bytes32",
                      "internalType": "bytes32"
                  }
              ]
          },
          {
              "name": "_referralManager",
              "type": "address",
              "internalType": "contract IReferralManager"
          }
      ],
      "stateMutability": "nonpayable"
  },
  {
      "type": "receive",
      "stateMutability": "payable"
  },
  {
      "type": "function",
      "name": "collectRewards",
      "inputs": [
          {
              "name": "looksRareClaim",
              "type": "bytes",
              "internalType": "bytes"
          }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "execute",
      "inputs": [
          {
              "name": "commands",
              "type": "bytes",
              "internalType": "bytes"
          },
          {
              "name": "inputs",
              "type": "bytes[]",
              "internalType": "bytes[]"
          },
          {
              "name": "referralAddress",
              "type": "address",
              "internalType": "address"
          }
      ],
      "outputs": [],
      "stateMutability": "payable"
  },
  {
      "type": "function",
      "name": "execute",
      "inputs": [
          {
              "name": "commands",
              "type": "bytes",
              "internalType": "bytes"
          },
          {
              "name": "inputs",
              "type": "bytes[]",
              "internalType": "bytes[]"
          },
          {
              "name": "deadline",
              "type": "uint256",
              "internalType": "uint256"
          },
          {
              "name": "referralAddress",
              "type": "address",
              "internalType": "address"
          }
      ],
      "outputs": [],
      "stateMutability": "payable"
  },
  {
      "type": "function",
      "name": "onERC1155BatchReceived",
      "inputs": [
          {
              "name": "",
              "type": "address",
              "internalType": "address"
          },
          {
              "name": "",
              "type": "address",
              "internalType": "address"
          },
          {
              "name": "",
              "type": "uint256[]",
              "internalType": "uint256[]"
          },
          {
              "name": "",
              "type": "uint256[]",
              "internalType": "uint256[]"
          },
          {
              "name": "",
              "type": "bytes",
              "internalType": "bytes"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "bytes4",
              "internalType": "bytes4"
          }
      ],
      "stateMutability": "pure"
  },
  {
      "type": "function",
      "name": "onERC1155Received",
      "inputs": [
          {
              "name": "",
              "type": "address",
              "internalType": "address"
          },
          {
              "name": "",
              "type": "address",
              "internalType": "address"
          },
          {
              "name": "",
              "type": "uint256",
              "internalType": "uint256"
          },
          {
              "name": "",
              "type": "uint256",
              "internalType": "uint256"
          },
          {
              "name": "",
              "type": "bytes",
              "internalType": "bytes"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "bytes4",
              "internalType": "bytes4"
          }
      ],
      "stateMutability": "pure"
  },
  {
      "type": "function",
      "name": "onERC721Received",
      "inputs": [
          {
              "name": "",
              "type": "address",
              "internalType": "address"
          },
          {
              "name": "",
              "type": "address",
              "internalType": "address"
          },
          {
              "name": "",
              "type": "uint256",
              "internalType": "uint256"
          },
          {
              "name": "",
              "type": "bytes",
              "internalType": "bytes"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "bytes4",
              "internalType": "bytes4"
          }
      ],
      "stateMutability": "pure"
  },
  {
      "type": "function",
      "name": "referralManager",
      "inputs": [],
      "outputs": [
          {
              "name": "",
              "type": "address",
              "internalType": "contract IReferralManager"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "supportsInterface",
      "inputs": [
          {
              "name": "interfaceId",
              "type": "bytes4",
              "internalType": "bytes4"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "bool",
              "internalType": "bool"
          }
      ],
      "stateMutability": "pure"
  },
  {
      "type": "function",
      "name": "uniswapV3SwapCallback",
      "inputs": [
          {
              "name": "amount0Delta",
              "type": "int256",
              "internalType": "int256"
          },
          {
              "name": "amount1Delta",
              "type": "int256",
              "internalType": "int256"
          },
          {
              "name": "data",
              "type": "bytes",
              "internalType": "bytes"
          }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
  },
  {
      "type": "event",
      "name": "RewardsSent",
      "inputs": [
          {
              "name": "amount",
              "type": "uint256",
              "indexed": false,
              "internalType": "uint256"
          }
      ],
      "anonymous": false
  },
  {
      "type": "event",
      "name": "onSwapped",
      "inputs": [
          {
              "name": "referralAddress",
              "type": "address",
              "indexed": true,
              "internalType": "address"
          }
      ],
      "anonymous": false
  },
  {
      "type": "error",
      "name": "BalanceTooLow",
      "inputs": []
  },
  {
      "type": "error",
      "name": "BuyPunkFailed",
      "inputs": []
  },
  {
      "type": "error",
      "name": "ContractLocked",
      "inputs": []
  },
  {
      "type": "error",
      "name": "ETHNotAccepted",
      "inputs": []
  },
  {
      "type": "error",
      "name": "ExecutionFailed",
      "inputs": [
          {
              "name": "commandIndex",
              "type": "uint256",
              "internalType": "uint256"
          },
          {
              "name": "message",
              "type": "bytes",
              "internalType": "bytes"
          }
      ]
  },
  {
      "type": "error",
      "name": "FromAddressIsNotOwner",
      "inputs": []
  },
  {
      "type": "error",
      "name": "InsufficientETH",
      "inputs": []
  },
  {
      "type": "error",
      "name": "InsufficientToken",
      "inputs": []
  },
  {
      "type": "error",
      "name": "InvalidBips",
      "inputs": []
  },
  {
      "type": "error",
      "name": "InvalidCommandType",
      "inputs": [
          {
              "name": "commandType",
              "type": "uint256",
              "internalType": "uint256"
          }
      ]
  },
  {
      "type": "error",
      "name": "InvalidOwnerERC1155",
      "inputs": []
  },
  {
      "type": "error",
      "name": "InvalidOwnerERC721",
      "inputs": []
  },
  {
      "type": "error",
      "name": "InvalidPath",
      "inputs": []
  },
  {
      "type": "error",
      "name": "InvalidReserves",
      "inputs": []
  },
  {
      "type": "error",
      "name": "InvalidSpender",
      "inputs": []
  },
  {
      "type": "error",
      "name": "LengthMismatch",
      "inputs": []
  },
  {
      "type": "error",
      "name": "SliceOutOfBounds",
      "inputs": []
  },
  {
      "type": "error",
      "name": "TransactionDeadlinePassed",
      "inputs": []
  },
  {
      "type": "error",
      "name": "UnableToClaim",
      "inputs": []
  },
  {
      "type": "error",
      "name": "UnsafeCast",
      "inputs": []
  },
  {
      "type": "error",
      "name": "V2InvalidPath",
      "inputs": []
  },
  {
      "type": "error",
      "name": "V2TooLittleReceived",
      "inputs": []
  },
  {
      "type": "error",
      "name": "V2TooMuchRequested",
      "inputs": []
  },
  {
      "type": "error",
      "name": "V3InvalidAmountOut",
      "inputs": []
  },
  {
      "type": "error",
      "name": "V3InvalidCaller",
      "inputs": []
  },
  {
      "type": "error",
      "name": "V3InvalidSwap",
      "inputs": []
  },
  {
      "type": "error",
      "name": "V3TooLittleReceived",
      "inputs": []
  },
  {
      "type": "error",
      "name": "V3TooMuchRequested",
      "inputs": []
  }
]
export type FlatFeeOptions = {
  amount: BigNumberish
  recipient: string
}
export type SwapOptions = Omit<RouterSwapOptions, 'inputTokenPermit'> & {
  inputTokenPermit?: Permit2Permit
  flatFee?: FlatFeeOptions
  referralAddress: string,
  chainId:number

}

export const SENDER_AS_RECIPIENT = '0x0000000000000000000000000000000000000001'
export const ROUTER_AS_RECIPIENT = '0x0000000000000000000000000000000000000002'
export const ETH_ADDRESS = '0x0000000000000000000000000000000000000000'

export enum CommandType {
  V3_SWAP_EXACT_IN = 0x00,
  V3_SWAP_EXACT_OUT = 0x01,
  PERMIT2_TRANSFER_FROM = 0x02,
  PERMIT2_PERMIT_BATCH = 0x03,
  SWEEP = 0x04,
  TRANSFER = 0x05,
  PAY_PORTION = 0x06,

  V2_SWAP_EXACT_IN = 0x08,
  V2_SWAP_EXACT_OUT = 0x09,
  PERMIT2_PERMIT = 0x0a,
  WRAP_ETH = 0x0b,
  UNWRAP_WETH = 0x0c,
  PERMIT2_TRANSFER_FROM_BATCH = 0x0d,
  BALANCE_CHECK_ERC20 = 0x0e,

  // NFT-related command types
  SEAPORT_V1_5 = 0x10,
  LOOKS_RARE_V2 = 0x11,
  NFTX = 0x12,
  CRYPTOPUNKS = 0x13,
  // 0x14
  OWNER_CHECK_721 = 0x15,
  OWNER_CHECK_1155 = 0x16,
  SWEEP_ERC721 = 0x17,

  X2Y2_721 = 0x18,
  SUDOSWAP = 0x19,
  NFT20 = 0x1a,
  X2Y2_1155 = 0x1b,
  FOUNDATION = 0x1c,
  SWEEP_ERC1155 = 0x1d,
  ELEMENT_MARKET = 0x1e,

  SEAPORT_V1_4 = 0x20,
  EXECUTE_SUB_PLAN = 0x21,
  APPROVE_ERC20 = 0x22,
}


const SIGNATURE_LENGTH = 65
const EIP_2098_SIGNATURE_LENGTH = 64

export interface Permit2Permit extends PermitSingle {
  signature: string
}
export function encodePermit(planner: CustomRoutePlanner, permit2: Permit2Permit): void {
  let signature = permit2.signature

  const length = ethers.utils.arrayify(permit2.signature).length
  // signature data provided for EIP-1271 may have length different from ECDSA signature
  if (length === SIGNATURE_LENGTH || length === EIP_2098_SIGNATURE_LENGTH) {
    // sanitizes signature to cover edge cases of malformed EIP-2098 sigs and v used as recovery id
    signature = ethers.utils.joinSignature(ethers.utils.splitSignature(permit2.signature))
  }

  planner.addCommand(CommandType.PERMIT2_PERMIT, [permit2, signature])
}



export type SwapRouterConfig = {
  sender?: string // address
  deadline?: BigNumberish
  referralAddress?:string
}

type SupportedNFTTrade = NFTTrade<SupportedProtocolsData>

export abstract class CustomSwapRouter {
  public static INTERFACE: Interface = new Interface(abi)




  /**
   * @deprecated in favor of swapCallParameters. Update before next major version 2.0.0
   * Produces the on-chain method name to call and the hex encoded parameters to pass as arguments for a given trade.
   * @param trades to produce call parameters for
   * @param options options for the call parameters
   */
  public static swapERC20CallParameters(
    trades: RouterTrade<Currency, Currency, TradeType>,
    options: SwapOptions
  ): MethodParameters {
    // TODO: use permit if signature included in swapOptions
    const planner = new CustomRoutePlanner()

    const trade: CustomUniswapTrade = new CustomUniswapTrade(trades, options)
    const inputCurrency = trade.trade.inputAmount.currency
    invariant(!(inputCurrency.isNative && !!options.inputTokenPermit), 'NATIVE_INPUT_PERMIT')

    if (options.inputTokenPermit) {
      encodePermit(planner, options.inputTokenPermit)
    }

    const nativeCurrencyValue = inputCurrency.isNative
      ? BigNumber.from(trade.trade.maximumAmountIn(options.slippageTolerance).quotient.toString())
      : BigNumber.from(0)

    trade.encode(planner, { allowRevert: false })
    return CustomSwapRouter.encodePlan(planner, nativeCurrencyValue, {
      deadline: options.deadlineOrPreviousBlockhash ? BigNumber.from(options.deadlineOrPreviousBlockhash) : undefined,
      referralAddress:options.referralAddress
    })
  }

  /**
   * Encodes a planned route into a method name and parameters for the Router contract.
   * @param planner the planned route
   * @param nativeCurrencyValue the native currency value of the planned route
   * @param config the router config
   */
  private static encodePlan(
    planner: CustomRoutePlanner,
    nativeCurrencyValue: BigNumber,
    config: SwapRouterConfig = {},

  ): MethodParameters {
    const { commands, inputs } = planner
    const functionSignature = !!config.deadline ? 'execute(bytes,bytes[],uint256,address)' : 'execute(bytes,bytes[],address)'

    const finalReferrerAddress = config.referralAddress?config.referralAddress:"0x0000000000000000000000000000000000000000";
    const parameters = !!config.deadline ? [commands, inputs, config.deadline,finalReferrerAddress] : [commands, inputs,finalReferrerAddress]
    const calldata = CustomSwapRouter.INTERFACE.encodeFunctionData(functionSignature, parameters)
    return { calldata, value: nativeCurrencyValue.toHexString() }
  }
}
