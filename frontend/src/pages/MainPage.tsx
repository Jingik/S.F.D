import { Button } from "@components/common/Button";

export function MainPage() {
  return (
  <>
    <p>메인 페이지입니다.</p>
    <Button name='로그인' color='#444444' path='login' />
    <Button name='회원가입' color='#333333' path='register' />
  </>)
}