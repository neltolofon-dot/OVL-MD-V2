let cmd = [];
let func = [];
function ovlcmd(v1, v2) {
  let v3 = v1;
  if (!v3.classe) {
    v3.classe = "Autres";
  }
  if (!v3.react) {
    v3.react = "🎐";
  }
  if (!v3.desc) {
    v3.desc = "Aucune description";
  }
  if (!v3.alias) {
    v3.alias = [];
  }
  if (typeof v3.isfunc === "undefined") {
    v3.isfunc = false;
  }
  v3.fonction = v2;
  if (v3.isfunc === true) {
    func.push(v3);
  } else {
    cmd.push(v3);
  }
  return v3;
}
module.exports = {
  ovlcmd,
  Module: ovlcmd,
  cmd,
  func,
};
