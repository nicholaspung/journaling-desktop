// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT
import {models} from '../models';

export function CheckTodayAffirmation(arg1:number):Promise<boolean>;

export function CreateNewAnswer(arg1:number,arg2:string):Promise<models.Answer>;

export function DeleteAffirmation(arg1:number):Promise<void>;

export function DeleteAffirmationLog(arg1:number):Promise<void>;

export function DeleteAnswer(arg1:number):Promise<void>;

export function DeleteQuestion(arg1:number):Promise<void>;

export function GetActiveAffirmation():Promise<models.Affirmation>;

export function GetAffirmationStreak():Promise<number>;

export function GetAllAffirmationLogs():Promise<Array<models.AffirmationLog>>;

export function GetAllAffirmations():Promise<Array<models.Affirmation>>;

export function GetAllAnswers():Promise<Array<models.Answer>>;

export function GetAllQuestions():Promise<Array<models.Question>>;

export function GetAnswerHistoryByQuestionID(arg1:number):Promise<Array<models.AnswerHistory>>;

export function GetQuestionById(arg1:number):Promise<models.Question>;

export function GetRandomQuestion():Promise<models.Question>;

export function GetRecentAnswers(arg1:number):Promise<Array<models.Answer>>;

export function LogAffirmation(arg1:number):Promise<void>;

export function SaveAffirmation(arg1:string):Promise<models.Affirmation>;

export function UpdateAffirmation(arg1:number,arg2:string):Promise<void>;

export function UpdateAnswer(arg1:number,arg2:string):Promise<void>;

export function UpdateQuestion(arg1:number,arg2:string):Promise<void>;
