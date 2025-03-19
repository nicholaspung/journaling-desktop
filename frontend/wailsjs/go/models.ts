export namespace models {
  export class Affirmation {
    id: number;
    content: string;
    // Go type: time
    createdAt: any;
    // Go type: time
    updatedAt: any;

    static createFrom(source: any = {}) {
      return new Affirmation(source);
    }

    constructor(source: any = {}) {
      if ("string" === typeof source) source = JSON.parse(source);
      this.id = source["id"];
      this.content = source["content"];
      this.createdAt = this.convertValues(source["createdAt"], null);
      this.updatedAt = this.convertValues(source["updatedAt"], null);
    }

    convertValues(a: any, classs: any, asMap: boolean = false): any {
      if (!a) {
        return a;
      }
      if (a.slice && a.map) {
        return (a as any[]).map((elem) => this.convertValues(elem, classs));
      } else if ("object" === typeof a) {
        if (asMap) {
          for (const key of Object.keys(a)) {
            a[key] = new classs(a[key]);
          }
          return a;
        }
        return new classs(a);
      }
      return a;
    }
  }
  export class AffirmationLog {
    id: number;
    affirmationId: number;
    // Go type: time
    completedAt: any;

    static createFrom(source: any = {}) {
      return new AffirmationLog(source);
    }

    constructor(source: any = {}) {
      if ("string" === typeof source) source = JSON.parse(source);
      this.id = source["id"];
      this.affirmationId = source["affirmationId"];
      this.completedAt = this.convertValues(source["completedAt"], null);
    }

    convertValues(a: any, classs: any, asMap: boolean = false): any {
      if (!a) {
        return a;
      }
      if (a.slice && a.map) {
        return (a as any[]).map((elem) => this.convertValues(elem, classs));
      } else if ("object" === typeof a) {
        if (asMap) {
          for (const key of Object.keys(a)) {
            a[key] = new classs(a[key]);
          }
          return a;
        }
        return new classs(a);
      }
      return a;
    }
  }
  export class Answer {
    id: number;
    questionId: number;
    content: string;
    // Go type: time
    createdAt: any;
    // Go type: time
    updatedAt: any;

    static createFrom(source: any = {}) {
      return new Answer(source);
    }

    constructor(source: any = {}) {
      if ("string" === typeof source) source = JSON.parse(source);
      this.id = source["id"];
      this.questionId = source["questionId"];
      this.content = source["content"];
      this.createdAt = this.convertValues(source["createdAt"], null);
      this.updatedAt = this.convertValues(source["updatedAt"], null);
    }

    convertValues(a: any, classs: any, asMap: boolean = false): any {
      if (!a) {
        return a;
      }
      if (a.slice && a.map) {
        return (a as any[]).map((elem) => this.convertValues(elem, classs));
      } else if ("object" === typeof a) {
        if (asMap) {
          for (const key of Object.keys(a)) {
            a[key] = new classs(a[key]);
          }
          return a;
        }
        return new classs(a);
      }
      return a;
    }
  }
  export class AnswerHistory {
    id: number;
    questionId: number;
    content: string;
    // Go type: time
    createdAt: any;
    // Go type: time
    updatedAt: any;

    static createFrom(source: any = {}) {
      return new AnswerHistory(source);
    }

    constructor(source: any = {}) {
      if ("string" === typeof source) source = JSON.parse(source);
      this.id = source["id"];
      this.questionId = source["questionId"];
      this.content = source["content"];
      this.createdAt = this.convertValues(source["createdAt"], null);
      this.updatedAt = this.convertValues(source["updatedAt"], null);
    }

    convertValues(a: any, classs: any, asMap: boolean = false): any {
      if (!a) {
        return a;
      }
      if (a.slice && a.map) {
        return (a as any[]).map((elem) => this.convertValues(elem, classs));
      } else if ("object" === typeof a) {
        if (asMap) {
          for (const key of Object.keys(a)) {
            a[key] = new classs(a[key]);
          }
          return a;
        }
        return new classs(a);
      }
      return a;
    }
  }
  export class CreativityEntry {
    id: number;
    content: string;
    entryDate: string;
    // Go type: time
    createdAt: any;
    // Go type: time
    updatedAt: any;

    static createFrom(source: any = {}) {
      return new CreativityEntry(source);
    }

    constructor(source: any = {}) {
      if ("string" === typeof source) source = JSON.parse(source);
      this.id = source["id"];
      this.content = source["content"];
      this.entryDate = source["entryDate"];
      this.createdAt = this.convertValues(source["createdAt"], null);
      this.updatedAt = this.convertValues(source["updatedAt"], null);
    }

    convertValues(a: any, classs: any, asMap: boolean = false): any {
      if (!a) {
        return a;
      }
      if (a.slice && a.map) {
        return (a as any[]).map((elem) => this.convertValues(elem, classs));
      } else if ("object" === typeof a) {
        if (asMap) {
          for (const key of Object.keys(a)) {
            a[key] = new classs(a[key]);
          }
          return a;
        }
        return new classs(a);
      }
      return a;
    }
  }
  export class GratitudeItem {
    id: number;
    content: string;
    entryDate: string;
    // Go type: time
    createdAt: any;

    static createFrom(source: any = {}) {
      return new GratitudeItem(source);
    }

    constructor(source: any = {}) {
      if ("string" === typeof source) source = JSON.parse(source);
      this.id = source["id"];
      this.content = source["content"];
      this.entryDate = source["entryDate"];
      this.createdAt = this.convertValues(source["createdAt"], null);
    }

    convertValues(a: any, classs: any, asMap: boolean = false): any {
      if (!a) {
        return a;
      }
      if (a.slice && a.map) {
        return (a as any[]).map((elem) => this.convertValues(elem, classs));
      } else if ("object" === typeof a) {
        if (asMap) {
          for (const key of Object.keys(a)) {
            a[key] = new classs(a[key]);
          }
          return a;
        }
        return new classs(a);
      }
      return a;
    }
  }
  export class GratitudeEntry {
    date: string;
    items: GratitudeItem[];

    static createFrom(source: any = {}) {
      return new GratitudeEntry(source);
    }

    constructor(source: any = {}) {
      if ("string" === typeof source) source = JSON.parse(source);
      this.date = source["date"];
      this.items = this.convertValues(source["items"], GratitudeItem);
    }

    convertValues(a: any, classs: any, asMap: boolean = false): any {
      if (!a) {
        return a;
      }
      if (a.slice && a.map) {
        return (a as any[]).map((elem) => this.convertValues(elem, classs));
      } else if ("object" === typeof a) {
        if (asMap) {
          for (const key of Object.keys(a)) {
            a[key] = new classs(a[key]);
          }
          return a;
        }
        return new classs(a);
      }
      return a;
    }
  }

  export class Question {
    id: number;
    content: string;
    // Go type: time
    createdAt: any;

    static createFrom(source: any = {}) {
      return new Question(source);
    }

    constructor(source: any = {}) {
      if ("string" === typeof source) source = JSON.parse(source);
      this.id = source["id"];
      this.content = source["content"];
      this.createdAt = this.convertValues(source["createdAt"], null);
    }

    convertValues(a: any, classs: any, asMap: boolean = false): any {
      if (!a) {
        return a;
      }
      if (a.slice && a.map) {
        return (a as any[]).map((elem) => this.convertValues(elem, classs));
      } else if ("object" === typeof a) {
        if (asMap) {
          for (const key of Object.keys(a)) {
            a[key] = new classs(a[key]);
          }
          return a;
        }
        return new classs(a);
      }
      return a;
    }
  }
}
