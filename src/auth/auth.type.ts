/* eslint-disable */
type FmbioAuthPayload = {
  address: string;
  name: string;
  bio: string;
};

type FundDetailsPayload = {
  comptrollerProxy: string;
  fundLogo: string;
  fundTicker: string;
  tags: string[];
  fundInfo: string;
  tokenProxy: string;
};
export type FmbioAuthPayloadType = Request & FmbioAuthPayload;
export type FundDetailsPayloadType = Request & FundDetailsPayload;
