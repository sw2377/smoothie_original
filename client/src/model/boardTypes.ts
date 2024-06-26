/* User List, Project List의 GET 요청의 Response data type */

export type CardType = "USER_CARD" | "PROJECT_CARD";
export type CardDataType = UserListDataType | ProjectListDataType;

export interface UserListDataType {
  teamBoardId?: number;
  title: string;
  position: string;
  keywords: string[];
  accountId?: number;
  teamBoardImageUrl?: string;
  techTagList: string[] | number[];
  nickname?: string;
  createdAt: string;
  modifiedAt?: string;
}

export interface ProjectListDataType {
  memberBoardId: number;
  title: string;
  content: string;
  status: string;
  views: number;
  position: string;
  writerNickName: string;
  writerImageURL: string;
  writerId: number;
  replyList?: ReplyDataType[];
  techTagList: string[];
  startDate: string;
  endDate: string;
  createdAt: string | Date;
  modifiedAt: string;
}

export interface ReplyDataType {
  writerId: number;
  writerNickName: string;
  writerImageURL: string;
  replyId: number;
  content: string;
  acceptType: string | "NONE" | "ACCEPT" | "REFUSE";
  createAt: string;
  apply: boolean;
}

export interface PageInfo {
  page: number;
  size: number;
  totalElements: number;
  totalpages: number;
}

export interface ApiResonse<T> {
  data: T[];
  pageInfo: PageInfo;
}

export type UserListResponse = ApiResonse<UserListDataType>;
export type ProjectListResponse = ApiResonse<ProjectListDataType>;
