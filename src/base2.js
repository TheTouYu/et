
// 5select, return 5,select object
function splitNumId(input) {
  const numericPart = input.replace(/[^\d]/g, ''); // 提取数字部分
  const alphaPart = input.replace(/[^a-zA-Z]/g, ''); // 提取字母部分

  return {
    num: numericPart,
    id: alphaPart
  };
}

module.exports = {
    splitNumId
};