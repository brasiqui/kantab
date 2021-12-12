import { createStore } from 'vuex'
import authenticator from "../authenticator";
import { apolloClient } from "../apollo";
import gql from "graphql-tag";

import toast from "../toast";

function showToast(msg) {
	toast.show({ title: msg });
}

import axios from "axios";
axios.defaults.headers.common["Content-Type"] = "application/json";

// Add a response interceptor
axios.interceptors.response.use(
	response => {
		// Do something with response data
		return response.data;
	},
	error => {
		// Forbidden, need to relogin
		if (error.response && error.response.status == 401) {
			authenticator.logout();
			return Promise.reject(error);
		}

		// Do something with response error
		if (error.response && error.response.data) return Promise.reject(error.response.data);

		return Promise.reject(error);
	}
);

export default createStore({
	state: {
		// Logged in user entity
		user: null,
		providers: [],
		board: null,
		boards: [],
		lists: []
	},

	getters: {},

	actions: {
		async init({ dispatch }) {
			try {
				await dispatch("getMe");
				await dispatch("getSupportedSocialAuthProviders");
				await dispatch("getBoards");
			} catch (err) {
				console.log("Error", err);
				//Raven.captureException(err);
			}
			//commit("READY");

			/*if (state.profile && state.profile._id) {
				this._vm.$ga.set("userId", state.profile._id);
			}*/
		},

		async getMe({ commit }) {
			const user = await axios.get("/api/v1/accounts/me");
			commit("SET_LOGGED_IN_USER", user);

			/*if (process.env.NODE_ENV == "production") {
				Raven.setUserContext(user);
				LogRocket.identify(user._id, user);
			}*/

			return user;
		},

		async getMeApollo({ commit }) {
			try {
				const user = await apolloClient.query({
					query: gql`
						query {
							me {
								id
								username
								fullName
								email
							}
						}
					`
				});
				return user.data.me;
			} catch (err) {
				console.log("error", err);
			}
			//commit("SET_LOGGED_IN_USER", user.data.me);
		},

		async getBoardById({ commit }, id) {
			try {
				const res = await apolloClient.query({
					query: gql`
						query boardById($id: String!) {
							boardById(id: $id) {
								id
								title
								slug
								description
								public
								archived
								createdAt
								updatedAt
								owner {
									username
									fullName
									avatar
								}
								lists(page: 1, pageSize: 10, sort: "position") {
									rows {
										id
										title
										description
										position
										color
										createdAt
										updatedAt
										cards(page: 1, pageSize: 20, sort: "position") {
											rows {
												id
												title
												position
											}
											total
										}
									}
									total
								}
							}
						}
					`,
					variables: { id }
				});
				commit("SET_BOARD", res.data.boardById);
				return res.data.boardById;
			} catch (err) {
				console.log("getBoardById error", err);
				showToast("Could not load board: " + err.message);
			}
		},

		async getBoards({ commit }) {
			try {
				const res = await apolloClient.query({
					query: gql`
						query boards {
							boards(page: 1, pageSize: 10, sort: "title") {
								rows {
									id
									title
									slug
									description
									public
									archived
									createdAt
									updatedAt
									owner {
										username
										fullName
										avatar
									}
								}
							}
						}
					`
				});
				commit("SET_BOARDS", res.data.boards.rows);
				return res.data.boards.rows;
			} catch (err) {
				console.log("getBoard error", err);
				showToast("Could not load boards: " + err.message);
			}
		},

		async createBoard({ commit }, input) {
			try {
				const res = await apolloClient.mutate({
					mutation: gql`
						mutation boardCreate($input: BoardCreateInput!) {
							boardCreate(input: $input) {
								id
								title
								slug
								description
								public
								archived
								createdAt
								updatedAt
								owner {
									username
									fullName
									avatar
								}
							}
						}
					`,
					variables: { input }
				});

				commit("ADD_BOARD", res.data.boardCreate);
				showToast("Board created");
			} catch (err) {
				console.error("createBoard err", err);
				showToast("Could not create board: " + err.message);
			}
		},

		async updateBoard({ commit }, input) {
			try {
				const res = await apolloClient.mutate({
					mutation: gql`
						mutation boardUpdate($input: BoardUpdateInput!) {
							boardUpdate(input: $input) {
								id
								title
								slug
								description
								public
								archived
								createdAt
								updatedAt
								owner {
									username
									fullName
									avatar
								}
							}
						}
					`,
					variables: { input }
				});

				commit("UPDATE_BOARD", res.data.boardUpdate);
				showToast("Board updated");
			} catch (err) {
				console.error("updateBoard error: ", err);
				showToast("Could not update board: " + err.message);
			}
		},

		async removeBoard({ commit }, id) {
			try {
				const res = await apolloClient.mutate({
					mutation: gql`
						mutation boardRemove($id: String!) {
							boardRemove(id: $id)
						}
					`,
					variables: { id }
				});

				commit("REMOVE_BOARD", res.data.boardRemove);
				showToast("Board removed");
			} catch (err) {
				console.error("removeBoard error: ", err);
				showToast("Board creation failed: " + err.message);
			}
		},

		async createList({ commit }, input) {
			console.log("input", input);
			try {
				const res = await apolloClient.mutate({
					mutation: gql`
						mutation listCreate($input: ListCreateInput!) {
							listCreate(input: $input) {
								id
								title
								description
								position
								cards {
									rows {
										id
										title
										description
										position
									}
									total
								}
							}
						}
					`,
					variables: { input }
				});
				console.log("res", res);
				commit("ADD_LIST", res.data.listCreate);
				showToast("List created");
			} catch (err) {
				console.error("createList err", err);
				showToast("Could not create list: " + err.message);
			}
		},

		async updateList({ commit }, input) {
			try {
				const res = await apolloClient.mutate({
					mutation: gql`
						mutation listUpdate($input: ListUpdateInput!) {
							listUpdate(input: $input) {
								id
								title
								description
								position
								cards {
									rows {
										id
										title
										description
										position
									}
									total
								}
							}
						}
					`,
					variables: { input }
				});

				commit("UPDATE_LIST", res.data.listUpdate);
				showToast("List updated");
			} catch (err) {
				console.error("updateList error: ", err);
				showToast("Could not update list: " + err.message);
			}
		},

		async removeList({ commit }, { id }) {
			console.log("id", id);
			try {
				const res = await apolloClient.mutate({
					mutation: gql`
						mutation listRemove($id: String!) {
							listRemove(id: $id)
						}
					`,
					variables: { id }
				});
				commit("REMOVE_LIST", res.data.listRemove);
				showToast("List removed");
			} catch (err) {
				console.error("removeList error: ", err);
				showToast("Could not remove list: " + err.message);
			}
		},

		async createCard({ commit }, { list, input }) {
			try {
				const res = await apolloClient.mutate({
					mutation: gql`
						mutation cardCreate($input: CardCreateInput!) {
							cardCreate(input: $input) {
								id
								title
								description
								position
							}
						}
					`,
					variables: { input }
				});
				console.log("res", res);
				commit("ADD_CARD", { list, card: res.data.cardCreate });
				showToast("Card created");
			} catch (err) {
				console.error("createCard err", err);
				showToast("Could not create card: " + err.message);
			}
		},

		async updateCard({ commit }, { list, input }) {
			try {
				const res = await apolloClient.mutate({
					mutation: gql`
						mutation cardUpdate($input: CardUpdateInput!) {
							cardUpdate(input: $input) {
								id
								title
								description
								position
							}
						}
					`,
					variables: { input }
				});

				commit("UPDATE_CARD", { list, card: res.data.cardUpdate });
				showToast("Card updated");
			} catch (err) {
				console.error("updateCard error: ", err);
				showToast("Could not update card: " + err.message);
			}
		},

		async removeCard({ commit }, { list, id }) {
			try {
				await apolloClient.mutate({
					mutation: gql`
						mutation cardRemove($id: String!) {
							cardRemove(id: $id)
						}
					`,
					variables: { id }
				});
				commit("REMOVE_CARD", { list, id });
				showToast("Card removed");
			} catch (err) {
				console.error("removeCard error: ", err);
				showToast("Could not remove card: " + err.message);
			}
		},

		async changeListPosition({ state, dispatch, commit }, { fromIndex, toIndex }) {
			let arr = state.board.lists.rows;

			const result = [...arr];
			let movedList;

			if (fromIndex !== null) {
				movedList = result.splice(fromIndex, 1)[0];
			}

			if (toIndex !== null) {
				result.splice(toIndex, 0, movedList);
			}

			let newPosition = 0;
			const toPrev = result[toIndex - 1];
			const toNext = result[toIndex + 1];
			if (!toNext) {
				newPosition = Math.ceil(toPrev.position + 1);
			} else if (!toPrev) {
				newPosition = Math.floor(toNext.position - 1);
			} else {
				newPosition = (toNext.position + toPrev.position) / 2;
			}
			console.debug(
				`Move ${movedList.title} to ${newPosition}. Between ${toNext?.position} <-> ${toPrev?.position}`
			);

			movedList.position = newPosition;
			commit("SET_NEW_LIST_ORDER", result);

			await dispatch("updateList", {
				id: movedList.id,
				position: newPosition
			});
		},

		async changeCardPosition({ state, dispatch, commit }, { list, fromIndex, toIndex, card }) {
			const result = [...list.cards.rows];

			if (fromIndex !== null) {
				result.splice(fromIndex, 1)[0];
			}

			if (toIndex !== null) {
				result.splice(toIndex, 0, card);

				let newPosition = 0;
				const toPrev = result[toIndex - 1];
				const toNext = result[toIndex + 1];
				if (!toNext && !toPrev) {
					newPosition = 1;
				} else if (!toNext) {
					newPosition = Math.ceil(toPrev.position + 1);
				} else if (!toPrev) {
					newPosition = Math.floor(toNext.position - 1);
				} else {
					newPosition = (toNext.position + toPrev.position) / 2;
				}
				console.debug(
					`Move ${card.title} to ${newPosition}. Between ${toNext?.position} <-> ${toPrev?.position}`
				);

				card.position = newPosition;
				list.cards.rows = result; // TODO
				// commit("SET_NEW_LIST_ORDER", result);

				await dispatch("updateCard", {
					list,
					input: {
						id: card.id,
						list: list.id,
						position: newPosition
					}
				});
			} else {
				// First call at moving between lists
				list.cards.rows = result; // TODO
			}
		},

		async getSupportedSocialAuthProviders({ commit }) {
			const providers = await axios.get("/auth/supported-social-auth-providers");
			commit("SET_AUTH_PROVIDERS", providers);

			return providers;
		},

		async unlinkSocial({ commit }, provider) {
			const user = await axios.get(`/api/v1/accounts/unlink?provider=${provider}`);
			commit("SET_LOGGED_IN_USER", user);

			return user;
		},

		logout({ commit }) {
			commit("LOGOUT");
		}
	},

	mutations: {
		SET_LOGGED_IN_USER(state, user) {
			state.user = user;
		},

		SET_AUTH_PROVIDERS(state, providers) {
			state.providers = providers;
		},

		LOGOUT(state) {
			state.user = null;
		},

		SET_BOARD(state, board) {
			state.board = board;
		},

		SET_BOARDS(state, boards) {
			state.boards = boards;
		},

		ADD_BOARD(state, board) {
			state.boards = [...state.boards, board];
		},

		UPDATE_BOARD(state, board) {
			const found = state.boards.find(b => b.id == board.id);
			if (found) {
				Object.assign(found, board);
			} else {
				state.boards = [...state.boards, board];
			}
		},

		REMOVE_BOARD(state, id) {
			state.boards = state.boards.filter(b => b.id !== id);
		},

		ADD_LIST(state, list) {
			state.board.lists.rows = [...state.board.lists.rows, list];
		},

		UPDATE_LIST(state, list) {
			const found = state.board.lists.rows.find(b => b.id == list.id);
			if (found) {
				Object.assign(found, board);
			} else {
				state.board.lists.rows = [...state.board.lists.rows, list];
			}
		},

		REMOVE_LIST(state, id) {
			state.board.lists.rows = state.board.lists.rows.filter(b => b.id !== id);
		},

		ADD_CARD(state, { list, card }) {
			list.cards.rows.push(card);
		},

		UPDATE_CARD(state, { list, card }) {
			const found = list.cards.rows.find(c => c.id == card.id);
			if (found) {
				Object.assign(found, card);
			} else {
				list.cards.rows.push(card);
			}
		},

		REMOVE_CARD(state, { list, id }) {
			const idx = list.cards.rows.findIndex(c => c.id === id);
			if (idx >= 0) list.cards.rows.splice(idx, 1);
		},

		SET_NEW_LIST_ORDER(state, listsInOrder) {
			state.board.lists.rows = listsInOrder;
		}
	}
});
