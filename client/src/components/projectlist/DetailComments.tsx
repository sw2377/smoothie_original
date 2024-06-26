import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ReactComponent as EditSvg } from "../../assets/icons/edit.svg";
import { ReactComponent as DeleteSvg } from "../../assets/icons/delete.svg";
import { ReactComponent as CheckSvg } from "../../assets/icons/check.svg";
import defaultProfile from "../../assets/images/default_profile.svg";

import Checkbox from "../../components/userlist,projectlist/Checkbox";
import ActionButton from "../../components/userlist,projectlist/ActionButton";
import Tooltip from "../../components/userlist,projectlist/Tooltip";
import { getTokensFromLocalStorage } from "../../utils/tokenStorage";

import { addComment, editComment, removeComment } from "../../redux/store";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";

import classes from "./DetailComments.module.css";

import authInstance from "../../utils/authInstance";

interface AccessTokenType {
  id: number;
}

const DetailComments = () => {
  const navigate = useNavigate();
  const { projectId } = useParams() as { projectId: string };

  const dispatch = useAppDispatch();
  const currentProject = useAppSelector(state => state.projects.currentData);

  const { replyList: comments, writerId } = currentProject || {};

  const token = getTokensFromLocalStorage() as AccessTokenType;
  let tokenId: number;
  let isMyProject = false; // 작성자가 본인인지 확인

  if (token) {
    tokenId = token.id;
    isMyProject = writerId === tokenId;
  }

  // 댓글 등록
  const [content, setContent] = useState("");
  const [isChecked, setIsChecked] = useState(false);

  const data = {
    content: content,
    isApply: isChecked,
    memberBoardId: projectId,
  };

  const handleChangeComment = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  /** Add Comment */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      alert("댓글은 로그인을 해야 작성할 수 있어요!");
      navigate("/login");
      return;
    }

    dispatch(addComment(data))
      .unwrap()
      .then(() => {
        // console.log("🚀 CREATE 성공", data);
        window.alert("댓글이 등록되었습니다.");
        window.location.reload();
      })
      .catch(error => {
        console.warn("🚀 CREATE 실패", error, data);
      })
      .finally();
  };

  /** Edit Comment */
  const [isEdit, setIsEdit] = useState(false);
  const [editableCommentId, setEditableCommentId] = useState<number | null>(
    null,
  );

  const [editedComment, setEditedComment] = useState("");

  const onEditComment = (targetId: number) => {
    // console.log("🚀 댓글 수정요청");

    const originComment = comments?.filter(
      comment => comment.replyId === targetId,
    );

    if (originComment) {
      // console.log("originComment", originComment[0].content);
      setEditedComment(originComment[0].content);
    }

    if (comments?.find(comment => comment.replyId === targetId)) {
      // console.log(targetId);
      setEditableCommentId(targetId);
    } else {
      setEditableCommentId(null);
    }

    setIsEdit(true);
  };

  const editData = {
    content: editedComment,
    // acceptType: 0,
  };

  const onSubmitEditComment = (targetId: number) => {
    // console.log("🚀 댓글 수정반영");

    dispatch(
      editComment({
        targetId,
        data: editData,
      }),
    )
      .unwrap()
      .then(() => {
        // console.log("EDIT", targetId);
        window.alert("댓글이 수정되었습니다.");
        window.location.reload();
      })
      .catch(error => {
        console.warn(
          "EDIT COMMENT ERROR",
          error,
          "targetId: ",
          targetId,
          editData,
        );
        // setError("Something went wrong");
      });
  };

  const handleChangeEditComment = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setEditedComment(e.target.value);
  };

  /** Remove Comment */
  const onRemoveComment = (targetId: number) => {
    // console.log("🚀 댓글 삭제하기");

    if (window.confirm("정말로 삭제하시겠습니까?")) {
      dispatch(removeComment(targetId))
        .unwrap()
        .then(() => {
          // console.log("DELETE", targetId);
          // 삭제가 성공하면 alert, 페이지 이동여부 확인
          window.alert("댓글이 삭제되었습니다.");
          window.location.reload();
        })
        .catch(error => {
          console.warn("DELETE COMMENT ERROR", error, "targetId: ", targetId);
          // setError("Something went wrong");
        });
      // .finally(() => setIsLoading(false));
    }
  };

  // 프로젝트 수락/거절
  // 프로젝트 수락은 acceptType 1 프로젝트 거절은 acceptType 2
  const handleAcceptOrReject = async (
    acceptType: number,
    targetId: number,
    targetUserName: string,
  ) => {
    try {
      await authInstance.patch(`/replys/accept/${targetId}`, {
        acceptType,
        alarmType: 0,
      });
      if (acceptType === 1) {
        window.alert(`${targetUserName}님을 프로젝트 팀원으로 수락하였습니다.`);
      } else if (acceptType === 2) {
        window.alert(`${targetUserName}님을 프로젝트 팀원으로 거절하였습니다.`);
      }
      window.location.reload();
    } catch (error) {
      console.warn(error);
    }
  };

  const handleAcceptBtn = (
    acceptType: number,
    targetId: number,
    targetUserName: string,
  ) => {
    // const acceptText = acceptType === 1 ? "수락" : "거절";

    if (
      acceptType === 1 &&
      window.confirm(
        `${targetUserName}님을 프로젝트 팀원으로 수락하시겠습니까?`,
      )
    ) {
      handleAcceptOrReject(acceptType, targetId, targetUserName);
    } else if (
      acceptType === 2 &&
      window.confirm(
        `${targetUserName}님을 프로젝트 팀원으로 거절하시겠습니까?`,
      )
    ) {
      handleAcceptOrReject(acceptType, targetId, targetUserName);
    }
  };

  const goToUserMyPage = (writerId: number) => {
    if (token) {
      navigate(`/mypage/${writerId}`);
    } else {
      alert("회원만 다른 유저의 프로필을 조회할 수 있어요!");
      navigate("/login");
    }
  };

  // 한국 시간으로 변환
  const getKoreaTime = (serverTime: string) => {
    const serverDate = new Date(serverTime);

    const koreaTimeOffset = 9 * 60; // 한국 표준시 계산
    const koreaTime = new Date(
      serverDate.getTime() + koreaTimeOffset * 60000,
    ).toLocaleString();

    return koreaTime;
  };

  return (
    <section className={classes.comments}>
      <h4>댓글</h4>
      <form className={classes.writeArea} onSubmit={handleSubmit}>
        <textarea
          placeholder="댓글을 남겨주세요!"
          onChange={handleChangeComment}
          value={content}
        ></textarea>
        <div className={classes.submitBtn}>
          <Checkbox
            title="apply"
            text="프로젝트 지원 댓글"
            infoText={true}
            isChecked={isChecked}
            setIsChecked={setIsChecked}
          />
          <ActionButton buttonType="submit">댓글 등록하기</ActionButton>
        </div>
      </form>
      <ul className={classes.commentsArea}>
        {comments?.map(comment => (
          <li key={comment.replyId} className={classes.comment}>
            <div className={classes.meta}>
              <div
                className={classes.userImage}
                onClick={() => goToUserMyPage(comment.writerId)}
              >
                <img src={comment.writerImageURL || defaultProfile} alt="" />
              </div>
              <div className={classes.usernameAndDate}>
                <div className={classes.username}>{comment.writerNickName}</div>
                <div className={classes.date}>
                  {getKoreaTime(comment.createAt)}
                </div>
              </div>
              <div className={classes.editArea}>
                {/* 수락/거절 후에는 댓글 수정/삭제 불가 */}
                {comment.writerId === tokenId &&
                comment.acceptType !== "ACCEPT" &&
                comment.acceptType !== "REFUSE" ? (
                  <>
                    <div className={classes.edit}>
                      {isEdit && editableCommentId === comment.replyId ? (
                        <div
                          className={classes.editDone}
                          onClick={() => onSubmitEditComment(comment.replyId)}
                        >
                          <CheckSvg />
                          <span className={classes.editDoneBtn}>수정하기</span>
                        </div>
                      ) : (
                        <EditSvg
                          width="16"
                          height="16"
                          onClick={() => onEditComment(comment.replyId)}
                        />
                      )}
                    </div>
                    <div
                      className={classes.delete}
                      onClick={() => onRemoveComment(comment.replyId)}
                    >
                      <DeleteSvg width="16" height="16" />
                    </div>
                  </>
                ) : null}
              </div>
            </div>
            <div className={classes.contents}>
              {isEdit && editableCommentId === comment.replyId ? (
                <textarea
                  className={classes.content}
                  value={editedComment}
                  onChange={handleChangeEditComment}
                />
              ) : (
                <div className={classes.content}>
                  {comment.apply ? (
                    <span className={classes.applyComment}>지원댓글</span>
                  ) : null}
                  {comment.content}
                </div>
              )}

              {isMyProject && comment.acceptType === "NONE" && comment.apply ? (
                <div className={classes.acceptArea}>
                  <ActionButton
                    type="outline"
                    handleClick={() =>
                      handleAcceptBtn(
                        1,
                        comment.replyId,
                        comment.writerNickName,
                      )
                    }
                  >
                    수락하기
                  </ActionButton>
                  <ActionButton
                    type="outline"
                    handleClick={() =>
                      handleAcceptBtn(
                        2,
                        comment.replyId,
                        comment.writerNickName,
                      )
                    }
                  >
                    거절하기
                  </ActionButton>
                </div>
              ) : null}
              {comment.acceptType === "ACCEPT" ? (
                <div className={classes.acceptArea}>
                  <Tooltip type="APPROVE">팀원으로 수락한 유저입니다.</Tooltip>
                </div>
              ) : null}
              {comment.acceptType === "REFUSE" ? (
                <div className={classes.acceptArea}>
                  <Tooltip type="REJECT">팀원으로 거절한 유저입니다.</Tooltip>
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default DetailComments;
