import AuthorityCtrl from "./authorityCtrl";

/**
 * 检查权限(判断当前用户是否具有某个权限)
 * @param loginUser 当前登录用户
 * @param needAuthority 需要有的权限
 * @return boolean 有无权限
 */
const checkAuthority = (
  loginUser: any,
  needAuthority = AuthorityCtrl.NOT_LOGIN
) => {
  //获取当前用户具有的权限(如果没有loginUser , 则表示未登录)
  const loginUserAuthority = loginUser?.userRole ?? AuthorityCtrl.NOT_LOGIN;
  //没有权限要求,即任何人都可以
  if (needAuthority === AuthorityCtrl.NOT_LOGIN) return true;

  //需要权限是用户
  if (needAuthority === AuthorityCtrl.USER) {
    if (loginUserAuthority === AuthorityCtrl.NOT_LOGIN) return false;
  }

  //需要权限是管理员
  if (needAuthority === AuthorityCtrl.ADMIN) {
    if (loginUserAuthority !== AuthorityCtrl.ADMIN) {
      return false;
    }
  }
  return true;
};

export default checkAuthority;
