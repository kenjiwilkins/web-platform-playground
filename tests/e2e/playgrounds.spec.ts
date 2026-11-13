import { expect, test } from '@playwright/test';
import { loadPlaygrounds } from '@wpp/schema';

/**
 * 全 Playground の全バリアントを開き、sandbox で例外なく実行されることを確かめる。
 * 対応判定（meta.detect）の結果はアノテーションとして記録するだけで、失敗にはしない。
 * 未対応ブラウザがあるのは当然で、その変化を追うのがこのプロジェクトの目的なので。
 */
for (const pg of loadPlaygrounds()) {
  pg.variants.forEach((variant, i) => {
    const url = i === 0 ? `/${pg.path}/` : `/${pg.path}/${variant.name}/`;

    test(`${pg.path} [${variant.name}]`, async ({ page }) => {
      await page.goto(url);
      const status = page.locator('[data-run-status]');
      await expect(status).toHaveAttribute('data-run-status', /ok|error/, { timeout: 15_000 });

      if (pg.meta.detect) {
        const detect = page.locator('[data-detect]');
        await expect(detect).toBeVisible();
        test.info().annotations.push({
          type: 'detect',
          description: `${await detect.getAttribute('data-ok')}: ${pg.meta.detect}`,
        });
      }

      await expect(status, 'sandbox 内で例外が発生した').toHaveAttribute('data-run-status', 'ok');
    });
  });
}

test('sandbox は許可していないオリジンからのメッセージを無視する', async ({ page }) => {
  await page.goto('http://localhost:4322/run/scratch/');
  await page.evaluate(() =>
    window.postMessage(
      { type: 'wpp:run', payload: { html: '<p id="x">pwned</p>', css: '', js: '' } },
      '*',
    ),
  );
  await page.waitForTimeout(300);
  await expect(page.locator('#x')).toHaveCount(0);
});
