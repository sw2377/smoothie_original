import { createSlice } from "@reduxjs/toolkit";
import {
  fetchUserCardList,
  getUserCard,
  addUserCard,
  editUserCard,
  removeUserCard,
} from "../thunks/userCardThunks";

import { UserListDataType, PageInfo } from "../../../model/boardTypes";

import dummyData from "../../../dummy-data.json";

interface UserState {
  data: UserListDataType[];
  pageInfo: PageInfo;
  editTitle: string;
}

const initialState: UserState = {
  data: [],
  pageInfo: {
    page: 1,
    size: 8,
    totalElements: 0,
    totalpages: 0,
  },
  editTitle: "",
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    getNewTitle: (state, action) => {
      state.editTitle = action.payload;
    },
  },
  extraReducers(builder) {
    // Fetch
    builder.addCase(fetchUserCardList.pending, () => {
      throw new Error("서버와 연결이 되지 않습니다.");
    });
    builder.addCase(fetchUserCardList.fulfilled, (state, action) => {
      state.data = action.payload.listData;
      state.pageInfo = action.payload.pageInfo;
    });
    builder.addCase(fetchUserCardList.rejected, state => {
      // dummy data 사용 test
      state.data = dummyData.teamboards.data;
      state.pageInfo = dummyData.teamboards.pageInfo;
    });

    // Get
    builder.addCase(getUserCard.pending, () => {
      // throw new Error(); // 서버 안될시 TEST
    });
    builder.addCase(getUserCard.fulfilled, () => {
      // state.data = action.payload;
    });
    builder.addCase(getUserCard.rejected, () => {
      // state.data = dummyData.teamboards.data; // 서버 안될시 TEST
    });

    // Add
    builder.addCase(addUserCard.pending, () => {
      // throw new Error(); // 서버 안될시 TEST
      // console.log("✅ ADD TEST PENDING");
    });
    builder.addCase(addUserCard.fulfilled, state => {
      // state.data.push(action.payload);
      state.editTitle = "";
      // console.log("✅ ADD TEST FULFILLED");
    });
    builder.addCase(addUserCard.rejected, () => {
      // console.log("action.payload", action.payload);
      // console.log("✅ ADD TEST REJECTED");
    });

    // Edit
    builder.addCase(editUserCard.pending, () => {
      // throw new Error(); // 서버 안될시 TEST
    });
    builder.addCase(editUserCard.fulfilled, state => {
      state.editTitle = "";
      // console.log("✅ EDIT USER FULFILLED");
    });
    builder.addCase(editUserCard.rejected, () => {
      // console.log("✅ EDIT USER REJECTED");
    });

    // Remove
    builder.addCase(removeUserCard.fulfilled, (state, actino) => {
      state.data = state.data.filter(usercard => {
        return usercard.teamBoardId !== actino.payload.teamBoardId;
      });
    });
  },
});

export const { getNewTitle } = usersSlice.actions;
export const usersReducer = usersSlice.reducer;
