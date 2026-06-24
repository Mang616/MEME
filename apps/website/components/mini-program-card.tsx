import Image from "next/image";
import { ASSETS } from "@/lib/site";

/** 微信小程序扫码区（下单页 #wechat 区块） */
export function MiniProgramCard() {
  return (
    <div className="card card-pad-lg card-center mini-program-card">
      <Image src={ASSETS.logo} alt="迷因电竞" width={72} height={72} className="card-logo" />
      <h3 className="card-title">迷因电竞小程序</h3>
      <p className="muted-copy muted-copy-sm">微信扫码，直接进入</p>
      <div className="qr-placeholder">小程序码</div>
      <p className="muted-copy muted-copy-xs note-spaced">也可以在微信里搜索迷因电竞</p>
    </div>
  );
}
