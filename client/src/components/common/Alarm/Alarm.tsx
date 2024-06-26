import { FC, useState, useEffect } from "react";
import bell from "../../../assets/icons/bell.svg";
import alarmBell from "../../../assets/icons/alarmBell.svg";
import classes from "./Alarm.module.css";
import AlarmItem from "./AlarmItem";
// import profile from "../../assets/images/default_profile.svg";
import authInstance from "../../../utils/authInstance";
import useInterval from "../../../hooks/useInterval";

interface AlarmItemProps {
  alarmId: number;
  alarmType: string;
  writerNickname: string;
  writerId: number;
  title: string;
  memberBoardId: number;
  checked: boolean;
}

const Alarm: FC = () => {
  // 알람창 띄워주는 역할
  const [open, setOpen] = useState(false);

  const handleActiveAlarmMenu = () => {
    setOpen(!open);
  };

  //TODO 새로운 알람 들어왔을 때 종이 흔들리는 효과
  // 기존의 alarm들 중 id가 가장 큰 값을 우선 maxAlarmId에 할당
  // 새로운 알람 id는 기존의 최댓값보다 더 큰 값인 새로운 최댓값이 된다
  // 얘는 흔들릴지 말지(클래스네임에서 삼항연산자로 shake랑 같이 쓸 거임)
  const [isShaking, setIsShaking] = useState(false);

  //TODO 이제 알람을 받아와볼까
  // 최대 id값 저장하는 함수
  const maxId = <T extends { alarmId: number }>(data: T[]): number => {
    return data.reduce((maxId, item) => {
      return item.alarmId > maxId ? item.alarmId : maxId;
    }, 0);
  };

  // 계속해서 업데이트 받을 alarmData, 그리고 거기서 얻어낸 최대 알람 id값
  const [alarmData, setAlarmData] = useState([]);

  // 새로운 api 콜 받기 전에 기존 알람 setPrevAlarmData 함수에 저장시키기(기존의 알람 id 최댓값 저장)
  const [prevAlarmData, setPrevAlarmData] = useState([]);

  const getAlarmData = async () => {
    try {
      const response = await authInstance.get("/alarms");
      setPrevAlarmData(alarmData); // 기존 알람 우선 저장
      setAlarmData(response.data); // 새 알람 업데이트
      if (maxId(alarmData) > maxId(prevAlarmData)) {
        setIsShaking(true);
      } else {
        setIsShaking(false);
      } // 서로 값 비교해서 새로운 최댓값이 등장했으면 종 흔들고 아니면 말고(되려나)
      return response.data;
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getAlarmData();
  }, []);

  useInterval(() => {
    getAlarmData();
  }, 3000);

  const remainAlarm = alarmData.some(
    (item: AlarmItemProps) => item.checked === false,
  );

  return (
    <>
      <div className={classes.alarm}>
        <img
          alt="alarm"
          src={
            alarmData.some((item: AlarmItemProps) => item.checked === false)
              ? alarmBell
              : bell
          }
          onClick={handleActiveAlarmMenu}
          className={isShaking && remainAlarm ? classes.shake : ""}
        />
        <div className={classes.menuContainer}>
          <div
            className={`${classes.dropdownMenu} ${
              open ? classes.dropdownMenu_active : classes.dropdownMenu_inactive
            }`}
          >
            <ul>
              {alarmData.length !== 0 ? (
                alarmData
                  .slice()
                  .reverse()
                  .map((item: AlarmItemProps) => (
                    <AlarmItem
                      key={item.alarmId}
                      memberBoardId={item.memberBoardId}
                      writerNickname={item.writerNickname}
                      title={item.title}
                      checked={item.checked}
                      alarmId={item.alarmId}
                    />
                  ))
              ) : (
                <AlarmItem />
              )}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Alarm;
