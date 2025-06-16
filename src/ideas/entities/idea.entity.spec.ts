import 'reflect-metadata';
import { classToPlain } from 'class-transformer';
import { Idea } from './idea.entity';
import { User } from '../../users/entities/user.entity';
import { Vote } from './vote.entity';
const API_MODEL_PROPERTIES_ARRAY = 'swagger/apiModelPropertiesArray';
const API_MODEL_PROPERTIES = 'swagger/apiModelProperties';

const uuidV4Regex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('Idea Entity', () => {
  it('should define a votes property', () => {
    const idea = new Idea();
    expect(idea).toHaveProperty('votes');
    // por padrão, antes de salvar, fica undefined
    expect(idea.votes).toBeUndefined();
  });

  it('should allow setting title, creator, votes and votesRelation', () => {
    const idea = new Idea();
    const user = new User();
    user.id = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
    user.username = 'alice';

    const vote1 = new Vote();
    vote1.id = '7c9e6679-7425-40de-944b-e07fc1f90ae7';
    vote1.idea = idea;

    idea.title = 'Nova ideia';
    idea.creator = user;
    idea.votes = 10;
    idea.votesRelation = [vote1];

    expect(idea.title).toBe('Nova ideia');
    expect(idea.creator).toBe(user);
    expect(idea.votes).toBe(10);
    expect(idea.votesRelation).toEqual([vote1]);

    expect(user.id).toMatch(uuidV4Regex);
    expect(vote1.id).toMatch(uuidV4Regex);
  });

  it('should exclude votesRelation when classToPlain is called', () => {
    const idea = new Idea();
    idea.id = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
    idea.title = 'Teste de exclusão';
    idea.votes = 5;

    const creator = new User();
    creator.id = '1c9e6679-7425-40de-944b-e07fc1f90ae7';
    creator.username = 'bob';
    idea.creator = creator;

    const voteA = new Vote();
    voteA.id = '9f8e6679-7425-40de-944b-e07fc1f90ae7';
    idea.votesRelation = [voteA];

    const plain = classToPlain(idea) as any;
    
    expect(plain.id).toMatch(uuidV4Regex);
    expect(plain.creator.id).toMatch(uuidV4Regex);

    expect(plain).toEqual({
      id: plain.id,
      title: 'Teste de exclusão',
      votes: 5,
      creator: {
        id: plain.creator.id,
        username: 'bob',
      },
    });
    expect(plain.votesRelation).toBeUndefined();
  });

  
});


describe('Idea Entity Swagger Metadata via Reflect Metadata', () => {
  it('deve ter ApiProperty em `creator` com type: () => User', () => {
    const props: string[] = Reflect.getMetadata(
      API_MODEL_PROPERTIES_ARRAY,
      Idea.prototype,
    );
    expect(Array.isArray(props)).toBe(true);

    const creatorEntry = props.find((p) => p === ':creator');
    expect(creatorEntry).toBe(':creator');

    const meta: { type: () => Function } = Reflect.getMetadata(
      API_MODEL_PROPERTIES,
      Idea.prototype,
      'creator',
    );
    expect(meta).toBeDefined();

    expect(typeof meta.type).toBe('function');
    expect((meta.type as () => Function)()).toBe(User);
  });
});