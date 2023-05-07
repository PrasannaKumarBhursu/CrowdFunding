import React, { useContext, createContext, useCallback, useState } from "react";
import {
  useAddress,
  useContract,
  useMetamask,
  useContractWrite,
} from "@thirdweb-dev/react";

import { ethers } from "ethers";

import { daysLeft } from "../utils/index";

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  const { contract } = useContract(
    "0xddE3b29aF1F0ef482bafb30D6b205D06cd98Ab10"
  );

  const { mutateAsync: createCampaign } = useContractWrite(
    contract,
    "createCampaign"
  );

  const address = useAddress();
  const connect = useMetamask();

  const [value, setValue] = useState("");

  const publishCampaign = async (form) => {
    console.log("context", form);

    try {
      const data = await createCampaign({
        args: [
          address,
          form.title,
          form.description,
          form.target,
          new Date(form.deadline).getTime(),
          form.image,
        ],
      });

      console.log("contract call success", data);
    } catch (error) {
      console.log("contract call failure", error);
    }
  };

  const getCampaigns = async (value) => {
    const notFilterdCampaigns = await contract.call("getCampaigns");

    const campaigns = notFilterdCampaigns.filter(
      (campaign) =>
        campaign.title.toLowerCase().includes(value) &&
        daysLeft(campaign.deadline.toNumber()) > 0
    );

    const parsedCampaigns = campaigns.map((campaign, i) => ({
      owner: campaign.owner,
      title: campaign.title,
      description: campaign.description,
      target: ethers.utils.formatEther(campaign.target.toString()),
      deadline: campaign.deadline.toNumber(),
      amountCollected: ethers.utils.formatEther(
        campaign.amountCollected.toString()
      ),
      image: campaign.image,
      pId: i,
    }));

    return parsedCampaigns;
  };

  const getUserCampaigns = async () => {
    const allCampaigns = await getCampaigns();
    const filteredCampaigns = allCampaigns.filter(
      (campaign) => campaign.owner === address
    );
    return filteredCampaigns;
  };

  const donate = async (pId, amount) => {
    const data = await contract.call("donateToCampaign", [pId], {
      value: ethers.utils.parseEther(amount),
    });

    return data;
  };

  const getDonations = async (pId) => {
    // console.log("PID", pId);
    const donations = await contract.call("getDonators", [pId]);
    // console.log("donations", donations);
    const numberOfDonations = donations[0].length;
    const parsedDonations = [];

    for (let i = 0; i < numberOfDonations; i++) {
      parsedDonations.push({
        donator: donations[0][0],
        donation: ethers.utils.formatEther(donations[1][i].toString()),
      });
    }

    // console.log("parsedDonations", parsedDonations);

    return parsedDonations;
  };

  return (
    <StateContext.Provider
      value={{
        address,
        contract,
        connect,
        createCampaign: publishCampaign,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations,
        value,
        setValue,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
