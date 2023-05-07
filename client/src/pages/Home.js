import React, { useState, useEffect } from "react";

import { DisplayCampaigns } from "../components/index";
import { useStateContext } from "../context/index";

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);

  const { address, contract, getCampaigns, value } = useStateContext();

  const fetchCampaigns = async () => {
    setIsLoading(true);
    const data = await getCampaigns(value);
    console.log(data);
    setCampaigns(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (contract) fetchCampaigns();
  }, [address, contract, value]);

  return (
    <DisplayCampaigns
      title="All Campaigns"
      isLoading={isLoading}
      campaigns={campaigns}
    />
  );
};

export default Home;
