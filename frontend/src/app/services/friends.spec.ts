import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FriendsService } from './friends';

describe('FriendsService', () => {
  let service: FriendsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(FriendsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads all registered players and their friendship state', () => {
    let result: unknown;
    service.listUsers().subscribe((users) => result = users);
    const request = http.expectOne('/api/friends');
    expect(request.request.method).toBe('GET');
    request.flush([{ id: 7, username: 'alice', isFriend: false }]);
    expect(result).toEqual([{ id: 7, username: 'alice', isFriend: false }]);
  });

  it('persists friend additions and removals', () => {
    service.addFriend(7).subscribe();
    const add = http.expectOne('/api/friends/7');
    expect(add.request.method).toBe('POST');
    add.flush(null);

    service.removeFriend(7).subscribe();
    const remove = http.expectOne('/api/friends/7');
    expect(remove.request.method).toBe('DELETE');
    remove.flush(null);
  });
});
