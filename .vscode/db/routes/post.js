const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../database');

// 영화 등록 또는 수정 함수
async function findOrCreateOrUpdateMovie({ title, director, genres, release_date, plot }) {
    try {
        const [movieRows] = await db.query('SELECT * FROM Movies WHERE title = ?', [title]);

        if (movieRows.length === 0) {
            const [result] = await db.query(
                'INSERT INTO Movies (title, director, genres, release_date, plot) VALUES (?, ?, ?, ?, ?)',
                [title, director, genres, release_date, plot]
            );
            return result.insertId;
        } else {
            const movie = movieRows[0];
            await db.query(
                'UPDATE Movies SET director = ?, genres = ?, release_date = ?, plot = ? WHERE movie_id = ?',
                [director, genres, release_date, plot, movie.movie_id]
            );
            return movie.movie_id;
        }
    } catch (error) {
        console.error('영화 등록/수정 오류:', error);
        throw error; // 오류를 상위 라우터로 전달
    }
}

// 사용자 등록 또는 조회 함수
async function findOrCreateUser(username) {
    try {
        const [userRows] = await db.query('SELECT * FROM Users WHERE username = ?', [username]);
        if (userRows.length === 0) {
            const [result] = await db.query('INSERT INTO Users (username) VALUES (?)', [username]);
            return result.insertId;
        }
        return userRows[0].user_id;
    } catch (error) {
        console.error('사용자 등록/조회 오류:', error);
        throw error; // 오류를 상위 라우터로 전달
    }
}

// 리뷰 목록 출력 + 페이징 + 정렬
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const sort = req.query.sort || 'newest';
    const limit = 5;
    const offset = (page - 1) * limit;

    // 정렬 방식 선택
    let orderBy = 'r.created_at DESC';
    if (sort === 'oldest') orderBy = 'r.created_at ASC';

    try {
        // 총 리뷰 수 계산
        const [countRows] = await db.query('SELECT COUNT(*) AS cnt FROM Reviews');
        const totalReviews = countRows[0].cnt;
        const totalPages = Math.ceil(totalReviews / limit);

        // 리뷰 목록 조회
        const [reviews] = await db.query(`
            SELECT r.review_id, r.rating, r.content, r.created_at,
                   m.title,
                   u.username
            FROM Reviews r
            JOIN Movies m ON r.movie_id = m.movie_id
            JOIN Users u ON r.user_id = u.user_id
            ORDER BY ${orderBy}
            LIMIT ? OFFSET ?
        `, [limit, offset]);

        res.render('review', {
            reviews,
            currentPage: page,
            totalPages,
            sort
        });
    } catch (err) {
        console.error('리뷰 목록 조회 실패:', err);
        res.status(500).send('리뷰 목록 조회 실패!');
    }
});

// 리뷰 등록 처리
router.post('/write', async (req, res) => {
    const { title, username, rating, content, director, genres, release_date, plot, password } = req.body;

    try {
        // 영화 찾기 또는 등록
        const movie_id = await findOrCreateOrUpdateMovie({ title, director, genres, release_date, plot });

        // 사용자 찾기 또는 등록
        const user_id = await findOrCreateUser(username);

        // 비밀번호 암호화
        const hashedPassword = await bcrypt.hash(password, 10);

        // 리뷰 등록 (비밀번호 포함)
        await db.query(
            'INSERT INTO Reviews (movie_id, user_id, rating, content, password) VALUES (?, ?, ?, ?, ?)',
            [movie_id, user_id, rating, content, hashedPassword]
        );

        res.redirect('/board');
    } catch (err) {
        console.error('❌ 리뷰 등록 실패:', err);
        res.status(500).send('리뷰 등록 실패!');
    }
});

// 리뷰 상세 보기
router.get('/:id', async (req, res) => {
    const reviewId = req.params.id;

    try {
        const [reviewRows] = await db.query(`
            SELECT r.*, m.title, m.director, m.genres, m.release_date, m.plot, u.username
            FROM Reviews r
            JOIN Movies m ON r.movie_id = m.movie_id
            JOIN Users u ON r.user_id = u.user_id
            WHERE r.review_id = ?
        `, [reviewId]);

        if (reviewRows.length === 0) return res.status(404).send('해당 리뷰를 찾을 수 없습니다.');

        const review = reviewRows[0];
        const [commentRows] = await db.query(`
            SELECT c.*, u.username
            FROM Comments c
            JOIN Users u ON c.user_id = u.user_id
            WHERE c.review_id = ?
            ORDER BY c.created_at ASC
        `, [reviewId]);

        res.render('review_detail', { review, comments: commentRows });
    } catch (err) {
        console.error('❌ 리뷰 상세 페이지 로딩 실패:', err);
        res.status(500).send('리뷰 상세 페이지 로딩 실패!');
    }
});

// 리뷰 수정 폼
router.get('/:id/edit', async (req, res) => {
    const reviewId = req.params.id;

    try {
        const [reviewRows] = await db.query(`
            SELECT r.*, m.title, m.director, m.genres, m.release_date, m.plot, u.username
            FROM Reviews r
            JOIN Movies m ON r.movie_id = m.movie_id
            JOIN Users u ON r.user_id = u.user_id
            WHERE r.review_id = ?
        `, [reviewId]);

        if (reviewRows.length === 0) return res.status(404).send('리뷰를 찾을 수 없습니다.');

        const review = reviewRows[0];
        res.render('edit_review', { review, error: null }); // 에러 메시지 초기화
    } catch (err) {
        console.error('❌ 리뷰 수정 페이지 로딩 실패:', err);
        res.status(500).send('리뷰 수정 페이지 로딩 실패!');
    }
});

// 리뷰 수정/삭제 시 비밀번호 확인 및 폼 렌더링 함수
async function checkPasswordAndRenderForm(req, res, reviewId, renderView, successRedirect) {
    const { password } = req.body;

    try {
        const [reviewRows] = await db.query(`
            SELECT password FROM Reviews WHERE review_id = ?
        `, [reviewId]);

        if (reviewRows.length === 0) {
            return res.status(404).send('리뷰를 찾을 수 없습니다.');
        }

        const storedPassword = reviewRows[0].password;
        const passwordMatch = await bcrypt.compare(password, storedPassword);

        if (!passwordMatch) {
            const [reviewRowsForRender] = await db.query(`
                SELECT r.*, m.title, m.director, m.genres, m.release_date, m.plot, u.username
                FROM Reviews r
                JOIN Movies m ON r.movie_id = m.movie_id
                JOIN Users u ON r.user_id = u.user_id
                WHERE r.review_id = ?
            `, [reviewId]);

            const review = reviewRowsForRender[0];
            return res.render(renderView, { review: review, error: '비밀번호가 일치하지 않습니다.' });
        }

        return true; // 비밀번호 일치
    } catch (err) {
        console.error('❌ 비밀번호 확인 오류:', err);
        res.status(500).send('비밀번호 확인 오류!');
        return false; // 오류 발생
    }
}

// 리뷰 수정 처리
router.post('/:id/edit', async (req, res) => {
    const reviewId = req.params.id;
    const { rating, content } = req.body;

    const passwordCheckResult = await checkPasswordAndRenderForm(req, res, reviewId, 'edit_review');

    if (passwordCheckResult === true) {
        try {
            // 비밀번호 일치 시 리뷰 업데이트
            await db.query(`
                UPDATE Reviews SET rating = ?, content = ? WHERE review_id = ?
            `, [rating, content, reviewId]); // reviewId를 파라미터로 전달

            res.redirect(`/board/${reviewId}`);
        } catch (err) {
            console.error('❌ 리뷰 수정 실패:', err);
            res.status(500).send('리뷰 수정 실패!');
        }
    }
});


// 리뷰 삭제 폼 (비밀번호 확인)
router.get('/:id/delete', async (req, res) => {
    const reviewId = req.params.id;

    try {
        const [reviewRows] = await db.query(`
            SELECT r.*, m.title, m.director, m.genres, m.release_date, m.plot, u.username
            FROM Reviews r
            JOIN Movies m ON r.movie_id = m.movie_id
            JOIN Users u ON r.user_id = u.user_id
            WHERE r.review_id = ?
        `, [reviewId]);

        if (reviewRows.length === 0) return res.status(404).send('리뷰를 찾을 수 없습니다.');

        const review = reviewRows[0];
        res.render('delete_review', { review, error: null }); // 삭제 폼 렌더링
    } catch (err) {
        console.error('❌ 리뷰 삭제 페이지 로딩 실패:', err);
        res.status(500).send('리뷰 삭제 페이지 로딩 실패!');
    }
});

// 리뷰 삭제 처리
router.post('/:id/delete', async (req, res) => {
    const reviewId = req.params.id;

    const passwordCheckResult = await checkPasswordAndRenderForm(req, res, reviewId, 'delete_review');

    if (passwordCheckResult === true) {
        try {
            // 비밀번호 일치 시 리뷰 삭제
            await db.query('DELETE FROM Reviews WHERE review_id = ?', [reviewId]);
            res.redirect('/board');
        } catch (err) {
            console.error('❌ 리뷰 삭제 실패:', err);
            res.status(500).send('리뷰 삭제 실패!');
        }
    }
});

// 비밀번호 확인 처리 (댓글/리뷰 구분)
router.post('/check-password', async (req, res) => {
    const { password, id, type } = req.body;

    try {
        let query = '';
        if (type === 'review') {
            query = 'SELECT password FROM Reviews WHERE review_id = ?';
        } else if (type === 'comment') {
            query = 'SELECT password FROM Comments WHERE comment_id = ?';
        } else {
            return res.status(400).json({ success: false, message: '유효하지 않은 type입니다.' });
        }

        const [rows] = await db.query(query, [id]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: '데이터 없음' });

        const match = await bcrypt.compare(password, rows[0].password);
        res.json({ success: match });
    } catch (err) {
        console.error('❌ 비밀번호 확인 오류:', err);
        res.status(500).json({ success: false, message: '서버 오류' });
    }
});

module.exports = router;
