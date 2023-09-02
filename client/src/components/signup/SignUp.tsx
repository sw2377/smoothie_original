import { FC } from "react";
import SocialSignUp from "./SocialSignUp";
import classes from "./SignUp.module.css";

import { useState } from "react";
import { validationActions } from "../../redux/validationSlice";
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import axios from "axios";

interface SignUpData {
  nickname: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const SignUp: FC = () => {
  const dispatch = useAppDispatch();

  const nicknameError = useAppSelector(state => state.validation.nicknameError);
  const emailError = useAppSelector(state => state.validation.emailError);
  const passwordError = useAppSelector(state => state.validation.passwordError);
  const confirmPasswordError = useAppSelector(
    state => state.validation.confirmPasswordError,
  );

  const [formData, setFormData] = useState<SignUpData>({
    nickname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    fieldName: string,
  ) => {
    const { value } = event.target;
    setFormData({
      ...formData,
      [fieldName]: value,
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      dispatch(validationActions.validNickname(formData.nickname));
      dispatch(validationActions.validEmail(formData.email));
      dispatch(validationActions.validPassword(formData.password));
      dispatch(validationActions.coinCidePassword(formData.confirmPassword));
      if (
        !nicknameError &&
        !emailError &&
        !passwordError &&
        !confirmPasswordError
      ) {
        const response = await axios.post("백엔드 엔드포인트", formData);
        console.log("회원가입 성공:", response.data);
      }
    } catch (error) {
      console.error("회원가입 실패:", error);
    }
  };

  return (
    <div className={classes.container}>
      <img alt="logo"></img>
      <SocialSignUp />
      <form className={classes.signUp} onSubmit={handleSubmit}>
        <div
          className={`${classes.inputInfo} ${
            nicknameError ? classes.errorInput : ""
          }`}
        >
          <label>Nickname</label>
          <input
            placeholder="Input Nickname"
            type="text"
            value={formData.nickname}
            onChange={e => handleInputChange(e, "nickname")}
          />
          {nicknameError && <p>닉네임은 2글자 이상 7글자 이하여야 합니다</p>}
        </div>
        <div
          className={`${classes.inputInfo} ${
            emailError ? classes.errorInput : ""
          }`}
        >
          <label>Email</label>
          <input
            placeholder="Input Email"
            type="text"
            value={formData.email}
            onChange={e => handleInputChange(e, "email")}
          />
          {emailError && <p>유효한 이메일 형식이 아닙니다</p>}
        </div>
        <div
          className={`${classes.inputInfo} ${
            passwordError ? classes.errorInput : ""
          }`}
        >
          <label>Password</label>
          <input
            placeholder="Input Password"
            type="password"
            value={formData.password}
            onChange={e => handleInputChange(e, "password")}
          />
          {passwordError && <p>비밀번호는 5글자 이상이어야 합니다</p>}
        </div>
        <div
          className={`${classes.inputInfo} ${
            confirmPasswordError ? classes.errorInput : ""
          }`}
        >
          <label>Confirm Password</label>
          <input
            placeholder="Input Password Again"
            type="password"
            value={formData.confirmPassword}
            onChange={e => handleInputChange(e, "confirmPassword")}
          />
          {confirmPasswordError && <p>비밀번호가 일치하지 않습니다</p>}
        </div>
        <button>Sign Up</button>
      </form>
    </div>
  );
};

export default SignUp;
