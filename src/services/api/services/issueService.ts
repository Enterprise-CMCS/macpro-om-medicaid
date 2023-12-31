import { v4 } from "uuid";
import { CreateIssue, Issue } from "shared-types";
import {
  DynamoDBClient,
  PutItemCommand,
  DeleteItemCommand,
  GetItemCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

export class IssueService {
  #dynamoInstance: DynamoDBClient;

  constructor(dynamoInstance: DynamoDBClient) {
    this.#dynamoInstance = dynamoInstance;
  }

  async createIssue({
    issue,
    tableName,
  }: {
    issue: CreateIssue;
    tableName: string;
  }) {
    const id = v4();
    const createdAt = new Date().toISOString();

    const input = {
      Item: marshall({ ...issue, id, createdAt }),
      TableName: tableName,
    };

    return await this.#dynamoInstance.send(new PutItemCommand(input));
  }

  async getIssue({ id, tableName }: { id: string; tableName: string }) {
    const input = new GetItemCommand({
      Key: marshall({ id }),
      TableName: tableName,
    });

    const result = await this.#dynamoInstance.send(input);

    return unmarshall(result.Item);
  }

  async getIssues({ tableName }: { tableName: string }) {
    let items: Issue[] = [];
    let isLastPage = false;
    let lastEvaluatedKey = null;
    while (!isLastPage) {
      const data = await this.#dynamoInstance.send(
        new ScanCommand({
          TableName: tableName,
          ExclusiveStartKey: lastEvaluatedKey,
        })
      );
      items = [...items, ...data.Items.map((item) => unmarshall(item))];
      lastEvaluatedKey = data.LastEvaluatedKey;
      isLastPage = !lastEvaluatedKey;
    }
    return items;
  }

  async deleteIssue({ id, tableName }: { id: string; tableName: string }) {
    const input = { Key: marshall({ id }), TableName: tableName };

    return await this.#dynamoInstance.send(new DeleteItemCommand(input));
  }

  async editIssue({
    id,
    issue,
    tableName,
  }: {
    id: string;
    issue: Omit<Issue, "id">;
    tableName: string;
  }) {
    const updatedAt = new Date().toISOString();

    const input = {
      Item: marshall({ ...issue, id, updatedAt }),
      TableName: tableName,
    };
    const result = await this.#dynamoInstance.send(new PutItemCommand(input));

    return result;
  }
}
