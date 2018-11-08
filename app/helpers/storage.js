export default class Storage {

  static store(key, item) {
    window.localStorage.setItem(key, JSON.stringify(item));
  }

  static load(key) {
    try {
      return JSON.parse(window.localStorage.getItem(key));
    }catch (e) {
      return null;
    }
  }

}