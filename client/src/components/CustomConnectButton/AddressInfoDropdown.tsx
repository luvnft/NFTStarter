import { useRef, useState } from "react";
import { NetworkOptions } from "./NetworkOptions";
import CopyToClipboard from "react-copy-to-clipboard";
import { createPortal } from "react-dom";
import {
  ArrowLeftEndOnRectangleIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
  QrCodeIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useLocalStorage } from "usehooks-ts";
import { BlockieAvatar } from "@/components/BlockieAvatar";
import { useOutsideClick } from "@/hooks/scaffold-stark";
import { Address } from "@starknet-react/chains";
import { useDisconnect, useNetwork } from "@starknet-react/core";
import { useScaffoldStarkProfile } from "@/hooks/scaffold-stark/useScaffoldStarkProfile";
import { isENS } from "@/utils/networks";
import { useRouter } from "next/router";

type AddressInfoDropdownProps = {
  address: Address;
  blockExplorerAddressLink: string | undefined;
  displayName: string;
  ensAvatar?: string;
};

export const AddressInfoDropdown = ({
  address,
  ensAvatar,
  displayName,
  blockExplorerAddressLink,
}: AddressInfoDropdownProps) => {
  const { disconnect } = useDisconnect();
  const [addressCopied, setAddressCopied] = useState(false);
  const { data: profile } = useScaffoldStarkProfile(address);
  const { chain } = useNetwork();
  const [showBurnerAccounts, setShowBurnerAccounts] = useState(false);
  const [selectingNetwork, setSelectingNetwork] = useState(false);
  const dropdownRef = useRef<HTMLDetailsElement>(null);
  const closeDropdown = () => {
    setSelectingNetwork(false);
    dropdownRef.current?.removeAttribute("open");
  };

  const router = useRouter();

  useOutsideClick(dropdownRef, closeDropdown);

  const [_, setLastConnector] = useLocalStorage<{ id: string; ix?: number }>(
    "lastUsedConnector",
    { id: "" },
    {
      initializeWithValue: false,
    },
  );

  return (
    <>
      <details ref={dropdownRef} className="dropdown dropdown-end leading-3">
        <summary
          tabIndex={0}
          className="btn h-12 bg-transparent btn-sm px-2 py-[0.35rem] dropdown-toggle gap-0 border border-[#5c4fe5] "
        >
          <div className="hidden [@media(min-width:412px)]:block">
            <BlockieAvatar address={address} size={28} ensImage={ensAvatar} />
          </div>
          <span className="ml-2 mr-2 text-sm">
            {isENS(displayName)
              ? displayName
              : profile?.name ||
                address?.slice(0, 6) + "..." + address?.slice(-4)}
          </span>
          <ChevronDownIcon className="h-6 w-4 ml-2 sm:ml-0 sm:block hidden" />
        </summary>
        <ul
          tabIndex={0}
          className={`dropdown-content menu z-[2] p-2 mt-2 rounded-[5px] gap-1 border border-[#5c4fe5] bg-base-100`}
        >
          <NetworkOptions hidden={!selectingNetwork} />
          <li className={selectingNetwork ? "hidden" : ""}>
            <button
              className="menu-item text-secondary-content btn-sm !rounded-xl flex gap-3 py-3"
              type="button"
              onClick={() => router.push(`/profile/${address}`)}
            >
              <UserCircleIcon className="h-6 w-4 ml-2 sm:ml-0" />{" "}
              <span>Profile</span>
            </button>
          </li>
          <li className={selectingNetwork ? "hidden" : ""}>
            {addressCopied ? (
              <div className="btn-sm !rounded-xl flex gap-3 py-3">
                <CheckCircleIcon
                  className="text-xl font-normal h-6 w-4 cursor-pointer ml-2 sm:ml-0"
                  aria-hidden="true"
                />
                <span className=" whitespace-nowrap">Copy address</span>
              </div>
            ) : (
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              <CopyToClipboard
                text={address}
                onCopy={() => {
                  setAddressCopied(true);
                  setTimeout(() => {
                    setAddressCopied(false);
                  }, 800);
                }}
              >
                <div className="btn-sm !rounded-xl flex gap-3 py-3">
                  <DocumentDuplicateIcon
                    className="text-xl font-normal h-6 w-4 cursor-pointer ml-2 sm:ml-0"
                    aria-hidden="true"
                  />
                  <span className=" whitespace-nowrap">Copy address</span>
                </div>
              </CopyToClipboard>
            )}
          </li>
          <li className={selectingNetwork ? "hidden" : ""}>
            <label
              htmlFor="qrcode-modal"
              className="btn-sm !rounded-xl flex gap-3 py-3"
            >
              <QrCodeIcon className="h-6 w-4 ml-2 sm:ml-0" />
              <span className="whitespace-nowrap">View QR Code</span>
            </label>
          </li>
          {/* {chain.network != "devnet" ? (
            <li className={selectingNetwork ? "hidden" : ""}>
              <button
                className="menu-item btn-sm !rounded-xl flex gap-3 py-3"
                type="button"
              >
                <ArrowTopRightOnSquareIcon className="h-6 w-4 ml-2 sm:ml-0" />
                <a
                  target="_blank"
                  href={blockExplorerAddressLink}
                  rel="noopener noreferrer"
                  className="whitespace-nowrap"
                >
                  View on Block Explorer
                </a>
              </button>
            </li>
          ) : null} */}

          {chain.network == "devnet" ? (
            <li className={selectingNetwork ? "hidden" : ""}>
              <button
                className="menu-item btn-sm !rounded-xl flex gap-3 py-3"
                type="button"
                onClick={() => {
                  setShowBurnerAccounts(true);
                }}
              >
                <UserCircleIcon className="h-6 w-4 ml-2 sm:ml-0" />
                <span className="whitespace-nowrap">Switch Account</span>
              </button>
            </li>
          ) : null}

          {showBurnerAccounts &&
            createPortal(
              <>
                <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                  <div className="relative w-auto my-6 mx-auto max-w-5xl">
                    <div className="border border-[#4f4ab7] rounded-lg shadow-lg relative w-full mx-auto md:max-h-[30rem] md:max-w-[25rem] bg-base-100 outline-none focus:outline-none">
                      <div className="flex items-start justify-between p-4 pt-8 rounded-t">
                        <div className="flex justify-center items-center w-11/12">
                          <h2 className="text-lg text-center text-neutral m-0">
                            Choose Account
                          </h2>
                        </div>
                        <button
                          className="w-8 h-8 place-content-end rounded-full justify-center items-center flex"
                          onClick={() => setShowBurnerAccounts(false)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                          >
                            <path
                              fill="currentColor"
                              d="m6.4 18.308l-.708-.708l5.6-5.6l-5.6-5.6l.708-.708l5.6 5.6l5.6-5.6l.708.708l-5.6 5.6l5.6 5.6l-.708.708l-5.6-5.6z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="backdrop-blur fixed inset-0 z-40"></div>
              </>,
              document.body,
            )}

          <li className={selectingNetwork ? "hidden" : ""}>
            <button
              className="menu-item text-secondary-content btn-sm !rounded-xl flex gap-3 py-3"
              type="button"
              onClick={() => disconnect()}
            >
              <ArrowLeftEndOnRectangleIcon className="h-6 w-4 ml-2 sm:ml-0" />{" "}
              <span>Disconnect</span>
            </button>
          </li>
        </ul>
      </details>
    </>
  );
};
