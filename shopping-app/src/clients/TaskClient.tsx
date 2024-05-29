import WithBootedClient from '../lib/WithBootedClient';
import RESTClient, { IArrayRestResponse } from './RESTClient';
import { IUserTasksByCategory } from '../models/tasks/IUserTasksByCategory';
import { ITask } from '../models/tasks/ITask';
import EurekaConsole from '../lib/EurekaConsole';
import { ITaskMetadata } from '../models/tasks/metadatas/ITaskMetadata';
import { IRecepmerMetadata } from '../models/tasks/metadatas/IRecepmerMetadata';

//const eureka = EurekaConsole({ label: "task-client" });

interface IConfig {
  baseURL: string
}

class TaskClient extends RESTClient implements WithBootedClient {
  constructor(config: IConfig) {
    super({ baseURL: config.baseURL });
  }

  async boot() { }

  async getByCategory<T extends ITaskMetadata>(categoryId: string): Promise<IUserTasksByCategory<T>> {

    const response = await this.axios.get(`/users/me/tasks?category=${categoryId}`);
    return {
      category: {
        id: categoryId,
        name: categoryId.toLocaleLowerCase()
      },
      items: (response.data as IArrayRestResponse<ITask<T>>)
    } as IUserTasksByCategory<T>

  }

  async getById<T extends ITaskMetadata>(taskId: string): Promise<ITask<T>> {

    const response = await this.axios.get(`/tasks/${taskId}`);
    return response.data as ITask<T>
  }

  async markAsCompleted(taskId: string): Promise<void> {

    await this.axios.put(`/users/me/tasks/${taskId}`);
    
  }

  async uploadPhoto(taskId: string, base64Image: string): Promise<void> {
    await this.axios.post(`/tasks/images`, 
    {
      created_at: new Date(),
      image: base64Image,
      task: taskId
    })
  }
}

export default new TaskClient({
  baseURL: process.env.REACT_APP_API_ENDPOINT!
});
